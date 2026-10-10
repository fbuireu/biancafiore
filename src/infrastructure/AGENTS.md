# src/infrastructure

Everything that talks to the outside world. The clients and the contact steps are Effect programs (ADR 0004); `images/` and `integrations/` are plain functions that run at build time.

## Client shape

Each client is a `Context.Tag` class plus a `Layer.effect` implementation, co-located:

| Tag | Live layer | File |
| --- | --- | --- |
| `CmsClient` | `CmsClientLive` | [`cms/client.ts`](./cms/client.ts) |
| `Database` | `DatabaseLive` | [`db/client.ts`](./db/client.ts) |
| `EmailClient` | `EmailClientLive` | [`email/server.ts`](./email/server.ts) |
| `LoggerService` | `LoggerServiceLive` | [`logging/service.ts`](./logging/service.ts) |

`LoggerServiceLive` is the one built with `Layer.sync` rather than `Layer.effect`, and that is the whole shape of it: it constructs nothing, reads no secret and cannot fail, because the adapter it hands back is a module-level object that was already there.

Adding a client:

- Its error class goes in [`errors.ts`](./errors.ts); don't define errors next to the client.
- **Secrets are read inside the layer, lazily**: `const { getSecret } = yield* Effect.promise(() => import("astro:env/server"))`. Never import `astro:env/server` at module top level: it breaks the Workers build and content loading.
- A secret the layer cannot build without is `Effect.die` (see `DatabaseLive`), with a message naming the secret.
- Its stub layer goes in [`src/tests/doubles/`](../tests/doubles), beside the others (ADR 0017).
- **`CmsClient` wraps EmDash's public query API, in process.** `CmsClientLive` imports `emdash` lazily and calls `getEmDashCollection` for one page of a collection, always `status: "published"`, and `getEmDashReferences` for one page of the entries a reference field points at, answering each by database id. Both hand an error back as data rather than throwing, and the client turns it into a `CmsError` naming the collection, so nothing downstream checks an `error` field. Those helpers serve drafts only to a preview or EmDash's edit mode, never to a plain request, so the client needs no token and no check of its own.
- **The client hands the ACL plain data.** `itemOf` turns EmDash's `Date`s into ISO strings, lifts the hydrated `terms` out of `data` into `terms.<taxonomy>` (each term's id, slug and label) and the hydrated byline credits into `bylines`, in credit order (each byline's id, slug, display name, bio, avatar and `customFields`), and keeps the database id and slug beside `data`, so a mapper never meets a framework object or EmDash's `edit` proxies. A credit names its avatar only by media id, without its dimensions, so `listEntries` reads each distinct avatar once through EmDash's `MediaRepository` over `getDb` from `emdash/runtime` and hands it on resolved like any other image.
- **Media is resolved by the client, not by a mapper.** EmDash stores an image as a storage key; `resolveMedia` in [`cms/media.ts`](./cms/media.ts) gives every local image a `src` on EmDash's media route (`/_emdash/api/media/file/<key>`), relative, because the media is served by this same Worker. An image from another provider, or one already carrying a `src`, is left alone.

## Reading content: `fetchEntries`

[`cms/entries.ts`](./cms/entries.ts) is the only way content is read, and the only thing `@application/entities` imports to read it. `fetchEntries<[RawEntry, …]>(query, …)` takes one query per array of raw entries it answers with (a `collection`, the `references` to read, an optional `orderBy`/`order`/`limit`) and returns a plain promise, so a loader needs no Effect, no `CmsClient` and no runtime of its own; `fetchReferences({ collection, id, field })` reads one reference field of one entry the same way. Some things belong to them rather than to their callers:

- the long-lived `ManagedRuntime` over `CmsClientLive`, one CMS client for the whole isolate
- `Effect.all(..., { concurrency: "unbounded" })`, so several queries overlap without a caller asking
- the `CmsError`, which stays a rejected promise: a page that lost the CMS answers 500 rather than rendering a short collection
- **the page cursor, and with it the promise that the answer is complete.** Each query is walked page by page, following the `nextCursor` EmDash hands back (capped at 100 per request, `EMDASH_MAX_PAGE_SIZE`) until it stops handing one, so every matching entry is in hand. EmDash's default page is 50, so a query that named no limit would silently answer the first fifty, and under the articles' `orderBy: "publish_date"` what it dropped would be the oldest writing. A loader that genuinely wants a slice passes an explicit `limit` and is then answered exactly that many. A page that comes back empty ends the walk even if it carried a cursor, so a cursor EmDash cannot serve cannot spin a request.
- **the references, one query per field per entry.** A collection query answers entries without them, so each reference field a query names is walked for every entry, `REFERENCE_READS_IN_FLIGHT` (8) entries at a time, and lands on the entry as `references.<field>`: the id of each target, never its fields. That is a query per entry, which is why no listing names one: an Article's Author is a byline credit, which the collection query already hydrates, and the only reference field read at all is `related_articles`, through `fetchReferences`, for the one Article a page shows.

It imports `CmsClientLive` across the module boundary rather than building the runtime inside `cms/client.ts`, and that is load-bearing: the loader tests swap `CmsClientLive` with `vi.mock("@infrastructure/cms/client", …)`, which a runtime closing over the client module's own binding would never see. ADR 0016.

## EmDash, in this Worker

EmDash is an integration of the site, not a client of it: `emdash()` in [`astro.config.ts`](../../astro.config.ts) over `d1({ binding: "DB" })` and `r2({ binding: "MEDIA" })`, and [`src/worker.ts`](../worker.ts), the Worker entry, which spreads EmDash's handler and adds its scheduled handler (the cron, named twice; the root guide's Gotchas) and its `PluginBridge`. Its routes all live under `/_emdash`, which [`src/middleware.ts`](../middleware.ts) leaves alone: EmDash sets its own content security policy there, stricter than the site's.

[`cms/plugins/`](./cms/plugins) holds the native plugins, each a descriptor `astro.config.ts` imports and a module exporting `createPlugin`, which the descriptor names by absolute path with forward slashes (a Windows backslash does not resolve as a Vite import). There are three. `editorialBlocks` declares the `splitBlock` Portable Text block with Block Kit fields, so editors can insert a split block in an Article's body, and it has no hooks, because the site renders the block itself (`SplitBlock` beside the article page's other components); a video is EmDash's own `iframe` block. `emailDelivery` is EmDash's email provider: it holds the `hooks.email-transport:register` capability (1.2's name for the deprecated `email:provide`) and the exclusive `email:deliver` hook, and hands every message (an invitation, a magic link, a recovery) to `EmailClient.sendCmsEmail`, the same Resend client and sender the contact form uses, tagged `cms`. Without it EmDash sends nothing and an invitation link has to be passed on by hand. `bylineCache` holds `bylines:read`, the capability EmDash requires before it registers a byline hook, and purges the `bylines` cache tag (`BYLINES_CACHE_TAG` in `@const/contentCache`) on `byline:afterSave` and `byline:afterDelete`, through `cache.purge` from `cloudflare:workers`, the call Astro's own Cloudflare cache provider makes: EmDash purges a collection's tag when an entry is written, but its byline routes purge nothing, so without it a changed bio or avatar would wait out the day's `max-age`. Vitest resolves `cloudflare:workers` to [`src/tests/doubles/cloudflareWorkers.ts`](../tests/doubles/cloudflareWorkers.ts), which records what was purged, and `cloudflare-workers.d.ts` beside the plugin types the one call it makes.

## Two runtimes

- `cms/entries.ts`: the `ManagedRuntime` above. Isolate-wide, read-only.
- [`layers.ts`](./layers.ts): `ContactLayer` (`DatabaseLive` + `EmailClientLive` + `LoggerServiceLive`), provided per request with `Effect.provide` inside the contact action. Nothing here holds request state.

## utils/

The steps the contact action composes, so [`src/actions`](../actions) stays pure orchestration. Only some of them need a client in `R`:

- [`guards.ts`](./utils/guards.ts): `validateContact` (zod → `ValidationError`) and `verifyRecaptcha`. **Neither requires a client**: `verifyRecaptcha` does its own lazy `astro:env/server` import and calls Google over plain `fetch`. A verdict Google gave and we rejected is a `ValidationError` carrying the bot copy: a score below `RECAPTCHA_MINIMUM_SCORE` (0.5), or `success: false` for a token that expired or was replayed (`timeout-or-duplicate`, `invalid-input-response`). A verdict never obtained is a `RecaptchaError`: the `fetch` rejected, the body was not readable JSON, the JSON was not a siteverify answer (`recaptchaVerificationSchema` refused it: no boolean `success`, a `score` that is not a number, `error-codes` that is not a list of strings), or siteverify answered `missing-input-secret`/`invalid-input-secret`, which is `GOOGLE_RECAPTCHA_SECRET_KEY` absent or rotated, and why `RecaptchaVerificationResponse`, inferred from that schema, reads `error-codes` at all. **A response carrying no score at all is rejected**: the guard is fail-closed and assumes reCAPTCHA v3, whose siteverify answer always scores, so swapping the site key for a v2 one starts failing every submission with the bot message, and this guard is what has to change with it.
- [`persistence.ts`](./utils/persistence.ts): `checkDuplicateContact`, requiring `Database` and `LoggerService`, and `saveContact`, requiring `Database`.
- [`email.tsx`](./utils/email.tsx): `sendEmail`, requiring `EmailClient`, plus one function that is not an Effect at all: `createEmail`, which is `async` because it renders React Email to html and text. `sendEmail` lifts it with `Effect.promise`, so a render that throws is a *defect*, not an `EmailError`: it never reaches the tag switch and the visitor gets the generic 500.

**Errors stay tagged**, and turning a tag into an HTTP status happens only in [`src/actions/errorResponse.ts`](../actions/errorResponse.ts) (`contactErrorResponse`), never here. That function forwards `failure.value.message` verbatim for `ValidationError` and `DuplicateContactError`, so their copy, written in `guards.ts`, `persistence.ts` and `@domain/contact/schema.ts`, reaches the visitor unchanged.

## `logging/`

Three files: `logger.ts` is **byte for byte what contribKit and forever-pto carry**, and `contract.ts` differs from theirs only in `LOG_SERVICE`. Keep them that way, because the whole point is that one Better Stack query reads all three repositories. [`logging/contract.ts`](./logging/contract.ts) holds `LOG_SERVICE`, `LOG_LEVEL` and `stripQuery`; [`logging/logger.ts`](./logging/logger.ts) holds the `logger` object, its methods each over one `write`; [`logging/service.ts`](./logging/service.ts) is this repository's Effect seam, `LoggerService` plus `Layer.sync(LoggerService, () => logger)`.

`console` is the transport (ADR 0020), and the single `noConsole` exemption in `biome.json` covers `logger.ts` and no other file.

**The spread order in `write` is load-bearing**: `...serializable(redacted(context))` first, then `service`, `level` and `message`, so a caller passing `{ level: "info" }` or `{ service: "something-else" }` cannot relabel its own line. Writing it the other way round reads identically, and `logger.test.ts` turns red on all three if the order is inverted. `redacted` strips the query string off a `url` a caller puts in the context. A context value `JSON.stringify` cannot write, a circular reference or a `BigInt`, is written as `"[unserializable]"` and the rest of the line still reaches the sink; a thrown object with neither JSON nor a `toString` is described by its tag. Every method runs inside one `try`, so not even a console that throws reaches the caller.

**A program that logs carries `LoggerService` in its `R`, and its return type is annotated**, so `R` answers "does this program log?" and an unintended log becomes a compile error at the function that introduced it. `LoggerServiceLive` resolves to the very object `logger.ts` exports, so the tag and the import cannot disagree: [`500.astro`](../pages/500.astro), whose frontmatter has no runtime, reaches it through the plain import because it has no layer to provide one.

## Other subfolders

- `images/`: `imageOptimization` and `imagePlaceholder`, both pure. `getOptimizedImageUrl` builds a `/cdn-cgi/image` URL for a same-origin image in a production build and answers the source itself everywhere else, since only the zone transforms. `imagePlaceholder` decodes the `blurhash` EmDash computes on upload into a small inline bitmap (`PLACEHOLDER_WIDTH` pixels wide, the height following the image, capped at `MAX_PLACEHOLDER_HEIGHT`), so a blur placeholder costs no request at all. A format EmDash computes no blurhash for, AVIF among them, renders unblurred.
- `integrations/`: build-time Astro integrations (`generateStaticHeaders`, which writes the headers `astro.config.ts` hands it into the `_headers` file the prerendered pages are served with)
- [`db/schema.ts`](./db/schema.ts): Drizzle tables; migrations live in `/drizzle`. [`db/client.ts`](./db/client.ts) imports the Workers-safe entry points only: `@libsql/client/web` + `drizzle-orm/libsql/web`.
