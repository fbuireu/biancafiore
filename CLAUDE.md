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
    styles/           # global CSS layer stack (see below)
    assets/           # images, svg-components (React)
  const/ data/ utils/ db/
```

Path aliases (`tsconfig.json`): `@const/* @infrastructure/* @domain/* @actions/* @application/* @modules/* (→ src/ui/modules) @utils/* @assets/* (→ src/ui/assets) @styles/* @data/* @shared/* @content/*`. Prefer aliases over relative paths.

**Effect infrastructure:** clients are `Context.Tag` + `Layer` (`CmsClientLive`, `DatabaseLive`, `EmailClientLive`), errors are `Data.TaggedError`. `runtime.ts` exposes `runCms` (a long-lived `ManagedRuntime` for CMS reads); `layers.ts` exposes `ContactLayer` (per-request, merges db + email) used by the contact action. DTOs are kept pure on purpose.

**Module convention:** each feature module lives under `ui/modules/<feature>/components/<Component>/` as a co-located pair — `Component.astro` + kebab-case `component.css`. Styling is per-component, not global. Shared layout/chrome (header, footer, seo, form, cookieConsent, themeToggle…) lives in `ui/modules/core/components/`.

## Conventions

- **CSS `@layer` order** (`src/ui/styles/index.css`): `reset, vendor, overrides, base, theme, global, modifiers, animations`. Respect it — cascade correctness depends on it. Design tokens (oklch colors, fluid type scale, vertical rhythm) live in `styles/global/variables.css` under `@layer theme`.
- **Design tokens over magic numbers.** Colors are oklch + `color-mix` scales; font sizes derive from `--ratio`/viewport bounds in CSS; spacing uses `--leading`/`--rhythm` with baseline snapping. Use existing tokens (`var(--font-size-*)`, `.editorial-headline`, etc.) rather than hardcoding.
- **Evergreen / Chromium-forward CSS.** Modern features are used freely (`light-dark()`, `interpolate-size`, `color-mix`, oklch); the build target is `esnext`.
- **No code comments.** Rationale belongs in commit messages / PRs / memory, not inline.
- **No Biome suppressions.** Fix the root cause (e.g. reorder selectors) instead of `biome-ignore`; suppress only if truly irreplaceable. Biome: 120 line width, `noConsole` error (only `console.error` allowed), organizeImports on. `src/data/**` and `public/**` are excluded from Biome.
- **Conventional commits** (commitlint + husky). semantic-release owns versioning. Do NOT add a Co-Authored-By / Claude trailer to commits or PRs.

## Gotchas

- **`light-dark()` in prod:** Astro 7's lightningcss downlevels `light-dark()` into an inherited-var polyfill that breaks nested `color-scheme` inversion in production (dev looks fine). Fixed via `Features.LightDark` in the `lightningcss.exclude` list in `astro.config.ts` — keep it there. `errorRecovery: true` is also set. See ADR 0006.
- **`astro dev` hangs / SSR 500s / blank globe:** usually `.vite` cache thrash from running `astro check` or a second `astro dev` beside a live dev server (orphans deps chunks: `effect.js` → 500, `three`/`react-globe.gl` → blank). Fix: stop all dev processes, delete `node_modules/.vite`, restart.
- **`HIDE_CHROME`** (public boolean env) hides site chrome (header/footer) — used for embedding/clean article rendering. Referenced in `ui/modules/core/components/baseLayout/BaseLayout.astro`, `articles/[...slug].astro`, the astro.config env schema, and the deploy workflow.
- **Turso env naming:** DB env vars are `ASTRO_DB_REMOTE_URL` / `ASTRO_DB_APP_TOKEN` despite the project no longer using Astro DB. Schema: `src/infrastructure/db/schema.ts`; migrations in `drizzle/`.
- **Image CDN switches by env:** Cloudflare image service in production build, Contentful/passthrough otherwise (`CLOUDFLARE_ENV === "production"` in astro.config → adapter `imageService`).
- **SSR externals:** `node:async_hooks` and `contentful` are externalized for SSR; the DB uses `@libsql/client/web` + `drizzle-orm/libsql/web`; `nodejs_compat` flag is enabled in `wrangler.toml`.

## Deploy

Cloudflare Workers via wrangler (`wrangler.toml`): `main` is the `@astrojs/cloudflare` server entrypoint, `dist/` served as assets, `SESSION` KV binding, custom domain `biancafiore.me` on `env.production`. CI/CD runs through GitHub Actions workflows.
