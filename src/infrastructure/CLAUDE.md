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

Effect programs that require a client in `R` and are composed by the action: `guards.ts` (zod validation → `ValidationError`, reCAPTCHA verification), `persistence.ts` (duplicate check, insert; maps SQLite constraint violations to `DuplicateContactError`), `email.tsx` (Resend payload + `normalizeEmail`). Keeping them here leaves `src/actions` as pure orchestration.

**Errors stay tagged.** Mapping to HTTP status or user-facing copy happens in `src/actions/index.ts` (`toActionError`), never here.

## Other subfolders

- `images/` — `imageOptimization`, `imagePlaceholder` (blur data URLs generated during loading)
- `integrations/` — build-time Astro integrations (`generateStaticHeaders`)
- `db/schema.ts` — Drizzle tables; migrations live in `/drizzle`. Workers-safe imports only: `@libsql/client/web` + `drizzle-orm/libsql/web`.
