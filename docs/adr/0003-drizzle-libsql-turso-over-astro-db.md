# Drizzle + libSQL/Turso instead of Astro DB

The contact-form persistence layer uses Drizzle ORM over a libSQL/Turso database (`@libsql/client/web`, `drizzle-kit` migrations, `dialect: "turso"`), having been deliberately migrated off Astro DB. Astro DB is itself a libSQL/Turso wrapper; moving to Drizzle directly gives real migrations, schema-as-code, and a client that survives regardless of Astro DB's maintenance status, at the cost of owning the client and migration tooling ourselves.

The env vars are still named `ASTRO_DB_REMOTE_URL` / `ASTRO_DB_APP_TOKEN` for continuity with the Turso instance provisioned under Astro DB — a historical artifact, not a remaining dependency on Astro DB.
