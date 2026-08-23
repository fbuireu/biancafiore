# src/infrastructure

Everything that talks to the outside world, wrapped in Effect. See ADR 0004.

## Client shape

Each client is a `Context.Tag` class plus a `Layer.effect` implementation, co-located:

| Tag | Live layer | File |
| --- | --- | --- |
| `CmsClient` | `CmsClientLive` | [`cms/client.ts`](./cms/client.ts) |
| `Database` | `DatabaseLive` | [`db/client.ts`](./db/client.ts) |
| `EmailClient` | `EmailClientLive` | [`email/server.ts`](./email/server.ts) |

Rules for a new client:

- The tag's service type exposes methods returning `Effect.Effect<A, XError>`, never raw promises.
- **It names the operations the site performs, and never re-exports the vendor's own object.** `Database` offers `findContactByEmail` and `insertContact`, not the drizzle query builder; `drizzle`, `eq` and the `Contact` table stay inside `DatabaseLive`. A tag that hands back the SDK hides only the connection: the caller still has to know the vendor's API, the declared error type is bypassable by awaiting the SDK directly, and the double in `tests/doubles/` has to re-implement the vendor to stand in for it. Adding a query means adding a method here, not reaching for the client.
- Wrap the SDK call in `Effect.tryPromise` and map `catch` to a `Data.TaggedError` from [`errors.ts`](./errors.ts). Add the new error class there; don't define errors next to the client.
- **Secrets are read inside the layer, lazily**: `const { getSecret } = yield* Effect.promise(() => import("astro:env/server"))`. Never import `astro:env/server` at module top level: it breaks the Workers build and content loading.
- Misconfiguration that can't be recovered from is `Effect.die` (see `DatabaseLive`), not a typed failure.
- `isContentfulConfigured()` lives beside the CMS client so a build without credentials skips fetching. It is the one place that reads `process.env` instead of `getSecret`: `fetchEntries` asks it synchronously, before any layer (and so any `astro:env/server` import) exists.

## Reading content: `fetchEntries`

[`cms/entries.ts`](./cms/entries.ts) is the only way content is read, and the only thing `@application/entities` imports to read it. `fetchEntries<[Skeleton, …]>(query, …)` takes one Contentful query per array of raw entries it answers with and returns a plain promise, so a loader needs no Effect, no `CmsClient` and no runtime of its own. Five things belong to it rather than to its six callers:

- the long-lived `ManagedRuntime` over `CmsClientLive`, one CMS client for the whole build/process
- the `isContentfulConfigured()` bail, which answers an empty array per query instead of fetching, so a loader cannot forget it
- `Effect.all(..., { concurrency: "unbounded" })`, so several queries overlap without a caller asking
- the `CmsError`, which stays a rejected promise: a content build that lost the CMS should die, not ship a short collection
- **the page cursor, and with it the promise that the answer is complete.** Each query is walked page by page (`skip`/`limit` against the `total` the collection reports, capped at 1000 per request, Contentful's maximum) until every matching entry is in hand. That is the whole point of owning it: Contentful's *undeclared* default is 100, so a query that names no limit silently answers the first hundred, and under the articles' `order: ["-fields.publishDate"]` what it drops is the oldest writing, with no error and no log. A loader that genuinely wants a slice passes an explicit `limit` and is then answered exactly that many: a stated editorial decision rather than a forgotten default. A page that comes back empty ends the walk, so a `total` the CMS cannot actually serve cannot hang a build

It imports `CmsClientLive` across the module boundary rather than building the runtime inside `cms/client.ts`, and that is load-bearing: the loader tests swap `CmsClientLive` with `vi.mock("@infrastructure/cms/client", …)`, which a runtime closing over the client module's own binding would never see. ADR 0016.

## Two runtimes, on purpose

- `cms/entries.ts`: the `ManagedRuntime` above. Process-wide, read-only.
- [`layers.ts`](./layers.ts): `ContactLayer` (`DatabaseLive` + `EmailClientLive`), provided per request with `Effect.provide` inside the contact action. Nothing here holds request state.

Don't collapse them into one layer: CMS reads are process-wide, contact writes are per-request.

## utils/

The steps the contact action composes, so [`src/actions`](../actions) stays pure orchestration. Only some of them need a client in `R`:

- [`guards.ts`](./utils/guards.ts): `validateContact` (zod → `ValidationError`) and `verifyRecaptcha`. **Neither requires a client**: `verifyRecaptcha` does its own lazy `astro:env/server` import and calls Google over plain `fetch`. **It fails two ways, and the line between them is whether a verdict was obtained at all.** A verdict we received and rejected is a `ValidationError` carrying the bot copy: a score below `RECAPTCHA_MINIMUM_SCORE` (0.5), and `success: false` for a token that expired or was replayed (`timeout-or-duplicate`, `invalid-input-response`), all of them the visitor's. A verdict we never got is a `RecaptchaError`: the `fetch` rejected, the body was not readable JSON, or siteverify answered `success: false` with `missing-input-secret`/`invalid-input-secret`, which is `GOOGLE_RECAPTCHA_SECRET_KEY` being absent or rotated rather than anything the visitor did, which is why `RecaptchaVerificationResponse` reads `error-codes` at all. Keep new codes on the side they belong to: a code that describes our configuration goes to `RecaptchaError`, a code that describes the token stays a `ValidationError`. The submission is refused either way; splitting the channel changed who is told what, not the policy. **A response carrying no score at all is rejected**, deliberately: the guard is fail-closed and assumes reCAPTCHA v3, whose siteverify answer always scores. Swap the site key for a v2 one and every submission starts failing with the bot message, blaming the visitor for a configuration change, so if that swap ever happens, this guard is what has to change with it.
- [`email.tsx`](./utils/email.tsx): `sendEmail`, requiring `EmailClient`, plus two functions that are not Effects at all: `normalizeEmail`, and `createEmail`, which is `async` because it renders React Email to html and text. `sendEmail` lifts it with `Effect.promise`, so a render that throws is a *defect*, not an `EmailError`: it never reaches the tag switch and the visitor gets the generic 500. That is the intended answer (a template that cannot render is our bug, not the visitor's), but it is why no typed error covers it.

**Errors stay tagged**, and turning a tag into an HTTP status happens only in [`src/actions/errorResponse.ts`](../actions/errorResponse.ts) (`contactErrorResponse`), never here. The *message* is the opposite: the copy for `ValidationError` and `DuplicateContactError` is written in this folder and reaches the visitor verbatim, because `contactErrorResponse` forwards `failure.value.message` for exactly those two tags. Every other message here is written for the Worker log instead: `RecaptchaError`'s says which of our own things failed, and no visitor ever reads it. Only the generic 500 text belongs to the action.

## Other subfolders

- `images/`: `imageOptimization`, `imagePlaceholder` (blur data URLs generated during loading). `getImagePlaceholders` takes every source at once and answers a `Map`, because **the burst is the module's decision, not the caller's**: it caps requests in flight, retries one that failed in transit, and logs how many placeholders were lost through Effect's `Logger`. Its predecessor read one source and left the fan-out to four loaders, all of which spread the whole collection over a single `Promise.all`: 62 simultaneous requests to `images.ctfassets.net` for Articles, of which the CDN dropped a sixth, and the bare `catch` reported none of it. The images shipped unblurred and the build said it succeeded. A source the module truly cannot read is simply absent from the `Map`
- `integrations/`: build-time Astro integrations (`generateStaticHeaders`)
- [`db/schema.ts`](./db/schema.ts): Drizzle tables; migrations live in `/drizzle`. Workers-safe imports only: `@libsql/client/web` + `drizzle-orm/libsql/web`.
