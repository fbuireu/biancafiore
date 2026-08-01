# 3. Drizzle + libSQL/Turso instead of Astro DB

Date: 2026-07-26

## Status

Accepted. Supersedes the original Astro DB persistence layer.

## Context

Contact-form submissions were persisted through Astro DB, which is itself a libSQL/Turso wrapper. That indirection bought a schema helper and cost real migrations, and it tied the one piece of durable state in the project to the maintenance status of an Astro-specific package.

## Decision

Persistence goes straight to Drizzle ORM over libSQL/Turso (`@libsql/client/web`, `drizzle-kit` migrations, `dialect: "turso"`). Dropping the wrapper gives real migrations, schema-as-code, and a client that outlives Astro DB, in exchange for owning the client and the migration tooling.

## Consequences

- The env vars are still named `ASTRO_DB_REMOTE_URL` / `ASTRO_DB_APP_TOKEN`, for continuity with the Turso instance provisioned under Astro DB. A historical artifact, not a remaining dependency — renaming them means re-provisioning secrets in CI and Cloudflare, which is why they stay.
- Migrations are files in `drizzle/` that someone has to run; nothing generates them at build time.
- The client is Workers-shaped (`drizzle-orm/libsql/web`), so Node-only Drizzle examples do not transfer ([ADR 0001](./0001-astro-ssr-on-cloudflare-workers.md)).
