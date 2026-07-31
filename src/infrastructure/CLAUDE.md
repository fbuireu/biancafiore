# src/infrastructure

Everything that talks to the outside world, wrapped in Effect. See ADR 0004.

## Client shape

Each client is a `Context.Tag` class plus a `Layer.effect` implementation, co-located:

| Tag | Live layer | File |
| --- | --- | --- |
| `CmsClient` | `CmsClientLive` | `cms/client.ts` |
| `Database` | `DatabaseLive` | `db/client.ts` |
| `EmailClient` | `EmailClientLive` | `email/server.ts` |

Rules for a new client:

- The tag's service type exposes methods returning `Effect.Effect<A, XError>` — never raw promises.
- Wrap the SDK call in `Effect.tryPromise` and map `catch` to a `Data.TaggedError` from `errors.ts`. Add the new error class there; don't define errors next to the client.
- **Secrets are read inside the layer, lazily**: `const { getSecret } = yield* Effect.promise(() => import("astro:env/server"))`. Never import `astro:env/server` at module top level — it breaks the Workers build and content loading.
- Misconfiguration that can't be recovered from is `Effect.die` (see `DatabaseLive`), not a typed failure.
- `isContentfulConfigured()` lives beside the CMS client so loaders can skip fetching without credentials. It is the one place that reads `process.env` instead of `getSecret`: a loader asks it synchronously, before any layer — and so any `astro:env/server` import — exists.

## Two runtimes, on purpose

- `runtime.ts` — a long-lived `ManagedRuntime` over `CmsClientLive`. Used by every content loader in `@application/entities`. One CMS client for the whole build/process.
- `layers.ts` — `ContactLayer` (`DatabaseLive` + `EmailClientLive`), provided per request with `Effect.provide` inside the contact action. Nothing here holds request state.

Don't collapse them into one layer: CMS reads are process-wide, contact writes are per-request.

## utils/

The steps the contact action composes, so `src/actions` stays pure orchestration. Only some of them need a client in `R`:

- `guards.ts` — `validateContact` (zod → `ValidationError`) and `verifyRecaptcha`. **Neither requires a client**: `verifyRecaptcha` does its own lazy `astro:env/server` import and calls Google over plain `fetch`, and a score below `RECAPTCHA_MINIMUM_SCORE` (0.5) fails as a `ValidationError` too — there is no separate reCAPTCHA error tag. **A response carrying no score at all is rejected**, deliberately: the guard is fail-closed and assumes reCAPTCHA v3, whose siteverify answer always scores. Swap the site key for a v2 one and every submission starts failing with the bot message, blaming the visitor for a configuration change — so if that swap ever happens, this guard is what has to change with it.
- `persistence.ts` — duplicate check and insert, both requiring `Database`; maps SQLite constraint violations to `DuplicateContactError`. **`isUniqueConstraintViolation` walks the whole `cause` chain, not just the immediate one.** Drizzle rethrows every driver rejection as a `DrizzleQueryError` carrying the real `LibsqlError` as its own `cause`, so by the time `run` in `db/client.ts` packs it into `DatabaseError.cause`, the `LibsqlError` sits one level down. Test only the top level and the `DuplicateContactError` arm of `saveContact` never fires under drizzle at all. **No HTTP status hangs on that arm**: the action wraps `saveContact` in a catch-all that swallows everything it can fail with, so the loser of a duplicate race is answered `ok` either way — it gets its mail out, and only its row is lost. What the walk buys is narrower and still real. The one log line then reads `You already contacted…` instead of drizzle's `Failed query:` dump, which is how an operator tells a row lost to the race from a database that is down; and `saveContact` keeps the failure type it advertises, since the walk is the only thing that ever makes the promised `DuplicateContactError` appear — narrow that catch-all to `DatabaseError` and the race starts answering `UNAUTHORIZED` with nothing in this folder needing to change. The tag is nowhere near dead either way — `checkDuplicatedEntries` raises it from a plain select hit, before any mail is sent, and *that* one reaches `toActionError` uncaught. The walk still matches an unwrapped `LibsqlError`, and visits each link once so a chain that loops back on itself cannot hang it.
- `email.tsx` — `sendEmail`, requiring `EmailClient`, plus two functions that are not Effects at all: `normalizeEmail`, and `createEmail`, which is `async` because it renders React Email to html and text. `sendEmail` lifts it with `Effect.promise`, so a render that throws is a *defect*, not an `EmailError`: it never reaches the tag switch and the visitor gets the generic 500. That is the intended answer — a template that cannot render is our bug, not the visitor's — but it is why no typed error covers it.

**Errors stay tagged**, and turning a tag into an HTTP status happens only in `src/actions/index.ts` (`toActionError`), never here. The *message* is the opposite: the copy for `ValidationError` and `DuplicateContactError` is written in this folder and reaches the visitor verbatim, because `toActionError` forwards `failure.value.message` for exactly those two tags. Only the generic 500 text belongs to the action.

## Other subfolders

- `images/` — `imageOptimization`, `imagePlaceholder` (blur data URLs generated during loading)
- `integrations/` — build-time Astro integrations (`generateStaticHeaders`)
- `db/schema.ts` — Drizzle tables; migrations live in `/drizzle`. Workers-safe imports only: `@libsql/client/web` + `drizzle-orm/libsql/web`.
