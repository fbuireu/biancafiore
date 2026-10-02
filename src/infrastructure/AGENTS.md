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
- `isContentfulConfigured()` lives beside the CMS client so a build without credentials skips fetching. It is the one place that reads `process.env` instead of `getSecret`: `fetchEntries` asks it synchronously, before any layer (and so any `astro:env/server` import) exists.

## Reading content: `fetchEntries`

[`cms/entries.ts`](./cms/entries.ts) is the only way content is read, and the only thing `@application/entities` imports to read it. `fetchEntries<[Skeleton, …]>(query, …)` takes one Contentful query per array of raw entries it answers with and returns a plain promise, so a loader needs no Effect, no `CmsClient` and no runtime of its own. Some things belong to it rather than to its callers:

- the long-lived `ManagedRuntime` over `CmsClientLive`, one CMS client for the whole build/process
- the `isContentfulConfigured()` bail, which answers an empty array per query instead of fetching, so a loader cannot forget it
- `Effect.all(..., { concurrency: "unbounded" })`, so several queries overlap without a caller asking
- the `CmsError`, which stays a rejected promise: a content build that lost the CMS should die, not ship a short collection
- **the page cursor, and with it the promise that the answer is complete.** Each query is walked page by page (`skip`/`limit` against the `total` the collection reports, capped at 1000 per request, Contentful's maximum) until every matching entry is in hand. Contentful's *undeclared* default is 100, so a query that names no limit would silently answer the first hundred, and under the articles' `order: ["-fields.publishDate"]` what it drops is the oldest writing, with no error and no log. A query that passes an explicit `limit` is answered at most that many. A page that comes back empty ends the walk, so a `total` the CMS cannot actually serve cannot hang a build

It imports `CmsClientLive` across the module boundary rather than building the runtime inside `cms/client.ts`, and that is load-bearing: the loader tests swap `CmsClientLive` with `vi.mock("@infrastructure/cms/client", …)`, which a runtime closing over the client module's own binding would never see. ADR 0016.

## Two runtimes

- `cms/entries.ts`: the `ManagedRuntime` above. Process-wide, read-only.
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

**A program that logs carries `LoggerService` in its `R`, and its return type is annotated**, so `R` answers "does this program log?" and an unintended log becomes a compile error at the function that introduced it. `LoggerServiceLive` resolves to the very object `logger.ts` exports, so the tag and the import cannot disagree: [`500.astro`](../pages/500.astro), whose frontmatter has no runtime, and `getImagePlaceholders`, which runs inside `astro build`, reach it through the plain import because neither has a layer to provide one.

## Other subfolders

- `images/`: `imageOptimization`, `imagePlaceholder` (blur data URLs generated during loading). `getImagePlaceholders` takes every source at once and answers a `Map`: it caps requests in flight, gives a source a second attempt when the first answers no image, and logs how many placeholders were lost through the `logger` import. A source the module truly cannot read is simply absent from the `Map`
- `integrations/`: build-time Astro integrations (`generateStaticHeaders`, which writes the security headers into the `_headers` file the prerendered pages are served with)
- [`db/schema.ts`](./db/schema.ts): Drizzle tables; migrations live in `/drizzle`. [`db/client.ts`](./db/client.ts) imports the Workers-safe entry points only: `@libsql/client/web` + `drizzle-orm/libsql/web`.
