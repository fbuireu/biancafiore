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
- `isContentfulConfigured()` lives beside the CMS client so loaders can skip fetching without credentials.

## Two runtimes, on purpose

- `runtime.ts` — a long-lived `ManagedRuntime` over `CmsClientLive`. Used by every content loader in `@application/entities`. One CMS client for the whole build/process.
- `layers.ts` — `ContactLayer` (`DatabaseLive` + `EmailClientLive`), provided per request with `Effect.provide` inside the contact action. Nothing here holds request state.

Don't collapse them into one layer: CMS reads are process-wide, contact writes are per-request.

## utils/

The steps the contact action composes, so `src/actions` stays pure orchestration. Only some of them need a client in `R`:

- `guards.ts` — `validateContact` (zod → `ValidationError`) and `verifyRecaptcha`. **Neither requires a client**: `verifyRecaptcha` does its own lazy `astro:env/server` import and calls Google over plain `fetch`, and a score below `RECAPTCHA_MINIMUM_SCORE` (0.5) fails as a `ValidationError` too — there is no separate reCAPTCHA error tag.
- `persistence.ts` — duplicate check and insert, both requiring `Database`; maps SQLite constraint violations to `DuplicateContactError`.
- `email.tsx` — `sendEmail`, requiring `EmailClient`, plus two plain functions that are not Effects at all: `normalizeEmail` and `createEmail`.

**Errors stay tagged**, and turning a tag into an HTTP status happens only in `src/actions/index.ts` (`toActionError`), never here. The *message* is the opposite: the copy for `ValidationError` and `DuplicateContactError` is written in this folder and reaches the visitor verbatim, because `toActionError` forwards `failure.value.message` for exactly those two tags. Only the generic 500 text belongs to the action.

## Other subfolders

- `images/` — `imageOptimization`, `imagePlaceholder` (blur data URLs generated during loading)
- `integrations/` — build-time Astro integrations (`generateStaticHeaders`)
- `db/schema.ts` — Drizzle tables; migrations live in `/drizzle`. Workers-safe imports only: `@libsql/client/web` + `drizzle-orm/libsql/web`.
