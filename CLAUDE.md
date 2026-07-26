# CLAUDE.md

Agent-facing guide for **biancafiore** — the portfolio/blog of a content writer. See [CONTEXT.md](./CONTEXT.md) for the domain glossary (article/project/testimonial/tag terminology, `isRepublished`/`originalSource`, etc.); do not duplicate it here.

## What this is

Astro 7 **SSR** site deployed to **Cloudflare Workers**. Content comes from **Contentful** (CMS), dynamic data (contact submissions) from **Drizzle + libSQL/Turso**. Uses **Effect** for infrastructure clients, **React 19** islands for interactive bits (globe, forms), and **lightningcss** for CSS. Static-content-heavy with a few server actions.

## Stack

- **Astro 7.1** (`output: "server"`), `@astrojs/cloudflare` adapter, React islands via `@astrojs/react`
- **Contentful** delivery/preview API (`contentful`, rich-text renderers)
- **Drizzle ORM** + `@libsql/client` → **Turso** (migrated off Astro DB; env vars still named `ASTRO_DB_*`)
- **Effect 3** — `Context.Tag` + `Layer` clients for cms/db/email
- **lightningcss** CSS transformer; **GSAP**, `react-globe.gl`/`three` (globe), `react-hook-form`, `resend` (email), reCAPTCHA v3, `vanilla-cookieconsent`
- **Biome** (lint + format), **Vitest** (unit), **Playwright** (e2e), **semantic-release** + commitlint (conventional commits)

## Versions (pinned — match exactly)

- Node **26.5.0** (`engines.node`)
- pnpm **11.15.1** (`packageManager`) — always use pnpm, never npm/yarn

## Commands

```bash
pnpm dev              # astro dev --open
pnpm build            # astro build
pnpm preview          # astro preview
pnpm wrangler:dev     # build + wrangler dev --remote (real Workers runtime)
pnpm deploy           # wrangler deploy --env production

pnpm check            # astro check (astro/tsx type + template check)
pnpm lint:ts:typecheck# tsc --noEmit
pnpm lint:all         # biome lint (append :fix to autofix)
pnpm format:all       # biome check --write

pnpm test:ut          # vitest (unit)
pnpm test:e2e         # playwright
pnpm test:all         # unit + e2e

pnpm db:generate      # drizzle-kit generate (migrations)
pnpm db:migrate       # apply migrations
pnpm db:push          # push schema to Turso
pnpm db:studio        # drizzle studio
```

Env: copy `.env.example`. Local secrets go in `.dev.vars` (loaded by `drizzle.config.ts` and wrangler). Env schema is declared/validated in `astro.config.ts` (`env.schema`) — add new vars there.

## Structure & aliases

```
src/
  pages/              # routes (index, about, contact, projects, articles/[...slug], tags/[slug], tags/index, rss.xml.ts, 404/500)
  actions/            # Astro server actions (contact form → Effect ContactLayer)
  content.config.ts   # content collections wired to @application/entities
  middleware.ts       # sets SECURITY_HEADERS on every response
  domain/              # DDD domain layer: per-concept models (schema.ts/types.ts) + pure rules (rules.ts). See ADR 0012
  application/         # anti-corruption layer: entities/* loaders + dto/*DTO.ts Contentful mappers (call domain rules)
  shared/              # cross-cutting ui/utils + generic helpers (slugify, formatDate, groupBy)
  infrastructure/     # cms/ db/ email/ clients (Effect), images/, integrations/, runtime.ts, layers.ts, errors.ts
  ui/
    modules/          # feature areas: home, about, article(s), contact, projects, legal, core
    styles/           # global CSS layer stack + design tokens
    assets/           # images, svg-components (React)
  const/ data/ utils/ db/
```

Path aliases (`tsconfig.json`): `@const/* @infrastructure/* @domain/* @actions/* @application/* @modules/* (→ src/ui/modules) @utils/* @assets/* (→ src/ui/assets) @styles/* @data/* @shared/* @content/*`. Prefer aliases over relative paths.

**Nested guides** — read the one for the folder you're touching, they carry the detail this file deliberately omits:

| Folder | Covers |
| --- | --- |
| [`src/domain/`](./src/domain/CLAUDE.md) | per-concept `schema`/`types`/`rules` layout, purity rules |
| [`src/application/`](./src/application/CLAUDE.md) | ACL: DTO mappers, collection loaders, adding a content type |
| [`src/infrastructure/`](./src/infrastructure/CLAUDE.md) | Effect clients, tagged errors, `runCms` vs `ContactLayer`, secrets |
| [`src/ui/styles/`](./src/ui/styles/CLAUDE.md) | `@layer` order, token system, colour scheme, page containers |
| [`src/ui/modules/`](./src/ui/modules/CLAUDE.md) | component/CSS co-location, islands, data access |

## Conventions

- **Design tokens over magic numbers**, and respect the CSS `@layer` order — cascade correctness depends on it. Details in [`src/ui/styles/CLAUDE.md`](./src/ui/styles/CLAUDE.md).
- **Evergreen / Chromium-forward CSS.** Modern features are used freely (`light-dark()`, `interpolate-size`, `color-mix`, oklch); the build target is `esnext`.
- **No code comments.** Rationale belongs in commit messages / PRs / memory, not inline.
- **No Biome suppressions.** Fix the root cause (e.g. reorder selectors) instead of `biome-ignore`; suppress only if truly irreplaceable. Biome: 120 line width, `noConsole` error (only `console.error` allowed), organizeImports on. `src/data/**` and `public/**` are excluded from Biome.
- **Conventional commits** (commitlint + husky). semantic-release owns versioning. Do NOT add a Co-Authored-By / Claude trailer to commits or PRs.

## Maintenance contract

These documents are not generated. Nothing verifies them, so a change that does not update them leaves the tree describing code that no longer exists. When you change code, update the docs **in the same commit** — a follow-up commit is a promise, not a fix.

| If you change | Update |
| --- | --- |
| What a domain word means, or introduce a new one | [`CONTEXT.md`](./CONTEXT.md) — the glossary, vocabulary only |
| A folder's layout, the files a concept is made of, or a rule its guide states | that folder's nested `CLAUDE.md` (table above) |
| A behaviour a doc states as an invariant or a gotcha | that bullet, or delete it if it stopped being true |
| An env var | `env.schema` in `astro.config.ts`, `.env.example`, and the Gotchas bullet if it has one |
| A package script, a path alias, or the folder tree | the *Commands* / *Structure & aliases* sections here |
| The layer boundaries, the rendering mode, or the deploy target | the *Stack* / *Deploy* sections here, plus the ADR that decided it |
| A decision an ADR records | that ADR — amend it, or supersede it with a new one and say so in both `## Status` blocks |

Propose an ADR in [`docs/adr/`](./docs/adr/) when a decision is **hard to reverse**, **surprising without context** and **the result of a real trade-off**. All three, or it is not an ADR. Number it one above the highest existing file (`NNNN-kebab-title.md`, `# N. Title` / Date / Status / Context / Decision / Consequences) and link it from wherever it bites — a Gotchas bullet here, a nested guide, a `CONTEXT.md` entry. There is no separate index; an ADR nothing links to will not be read.

Two traps worth naming, because both have already happened here: deleting a resolved entry from a "known inconsistencies" or gotchas list is part of the fix, not tidying to do later; and a `file.ts:123` citation silently rots the moment anything above it moves — prefer naming the symbol.

## Gotchas

- **`light-dark()` in prod:** lightningcss downlevels it into a polyfill that breaks nested `color-scheme` inversion in production (dev looks fine). `Features.LightDark` stays in `lightningcss.exclude` in `astro.config.ts`; `errorRecovery: true` is also set. ADR 0006, and [`src/ui/styles/CLAUDE.md`](./src/ui/styles/CLAUDE.md).
- **`astro dev` hangs / SSR 500s / blank globe:** usually `.vite` cache thrash from running `astro check` or a second `astro dev` beside a live dev server (orphans deps chunks: `effect.js` → 500, `three`/`react-globe.gl` → blank). Fix: stop all dev processes, delete `node_modules/.vite`, restart.
- **`HIDE_CHROME`** (public boolean env) hides site chrome (header/footer) — used for embedding/clean article rendering. Referenced in `ui/modules/core/components/baseLayout/BaseLayout.astro`, `articles/[...slug].astro`, the astro.config env schema, and the deploy workflow.
- **Turso env naming:** DB env vars are `ASTRO_DB_REMOTE_URL` / `ASTRO_DB_APP_TOKEN` despite the project no longer using Astro DB. Schema: `src/infrastructure/db/schema.ts`; migrations in `drizzle/`.
- **Image CDN switches by env:** Cloudflare image service in production build, Contentful/passthrough otherwise (`CLOUDFLARE_ENV === "production"` in astro.config → adapter `imageService`).
- **SSR externals:** `node:async_hooks` and `contentful` are externalized for SSR; the DB uses `@libsql/client/web` + `drizzle-orm/libsql/web`; `nodejs_compat` flag is enabled in `wrangler.toml`.

## Deploy

Cloudflare Workers via wrangler (`wrangler.toml`): `main` is the `@astrojs/cloudflare` server entrypoint, `dist/` served as assets, `SESSION` KV binding, custom domain `biancafiore.me` on `env.production`. CI/CD runs through GitHub Actions workflows.
