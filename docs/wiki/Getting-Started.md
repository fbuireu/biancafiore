# Getting Started

## Requirements

Node and pnpm are both pinned exactly once, and the manifest is what pins them: read `engines.node` (mirrored in `.nvmrc`, which is what every CI job installs from) and `packageManager` in `package.json` rather than a number written down elsewhere. **Always pnpm**, never npm or yarn.

## Install

```bash
pnpm install
cp .env.example .env    # fill in the values
pnpm dev                # astro dev, no browser
```

`pnpm dev:open` opens one. Local secrets go in `.dev.vars`, which both wrangler and `drizzle.config.ts` load; the env schema itself is declared and validated in `astro.config.ts` under `env.schema`, and a new variable is added there first.

The CMS runs inside `pnpm dev`: EmDash serves its admin at `/_emdash/admin` against a local D1 database and R2 bucket under `.wrangler/state`, and the dev server prints a dev-bypass link that signs you in without a passkey. The local database starts empty, and content pages fail until it holds an Author; `pnpm import:contentful` fills it from Contentful, with a token minted in the local admin.

## Running in the real runtime

```bash
pnpm wrangler:dev       # build + wrangler dev --remote
```

`astro dev` is a Vite server, not a Worker. Reach for `wrangler:dev` whenever a change touches anything server-side: the middleware, a server action, the adapter, or a binding.

## The checks

```bash
pnpm verify             # format:check && typecheck && check && test:ut:coverage
```

That one command is the CI gate, so running it locally is running what the pull request will run. The `pre-push` hook runs `pnpm verify:changed`, the same static checks followed by only the unit tests affected by what changed since `origin/main`, and then the docs test, which a changed-only run cannot select. Its parts, plus the rest:

```bash
pnpm check              # astro check (type + template)
pnpm typecheck          # astro sync && tsc --noEmit
pnpm lint:all           # biome lint (append :fix to autofix)
pnpm format:all         # biome check --write
pnpm test:ut            # unit tests (vitest)
pnpm test:built         # build, then assert what it emits: the legal pages and the headers
pnpm test:e2e           # playwright
```

`pnpm test:e2e` runs every spec in Chromium and in WebKit, the engine behind Safari, so install both browsers once with `pnpm exec playwright install chromium webkit`.

A run shows more than one Vitest summary and they are different suites: the `node` and `dom` projects are the unit tests, and `built` is the handful of assertions over the emitted output, which cannot run until something has been built.

## Database

Contact submissions go to Turso through Drizzle. The env vars are named `ASTRO_DB_REMOTE_URL` and `ASTRO_DB_APP_TOKEN` even though the project no longer uses Astro DB; [Content Model](Content-Model) says why the name stayed.

```bash
pnpm db:generate        # drizzle-kit generate (migrations)
pnpm db:migrate         # apply them
pnpm db:studio          # drizzle studio
```

## Before your first pull request

- **Conventional commits are mandatory.** commitlint enforces them, semantic-release derives the version and changelog from them. The **pull request title** is the one that survives, because `main` takes squash merges.
- **How code is written here** is [`CODING_STANDARDS.md`](https://github.com/fbuireu/biancafiore/blob/main/CODING_STANDARDS.md), which opens with what the tooling already enforces.
- **The docs are part of the change.** Change code and documentation in the same commit: a test reads these documents and fails the build when they disagree with the repository.

The full contributor guide is [`CONTRIBUTING.md`](https://github.com/fbuireu/biancafiore/blob/main/.github/CONTRIBUTING.md).
