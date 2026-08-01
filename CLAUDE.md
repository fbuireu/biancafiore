# CLAUDE.md

Agent-facing guide for **biancafiore** — the portfolio/blog of a content writer. See [CONTEXT.md](./CONTEXT.md) for the domain glossary (article/project/testimonial/tag terminology, `isRepublished`/`originalSource`, etc.); do not duplicate it here.

## What this is

Astro 7 **SSR** site deployed to **Cloudflare Workers**. Content comes from **Contentful** (CMS), dynamic data (contact submissions) from **Drizzle + libSQL/Turso**. Uses **Effect** for infrastructure clients, **React 19** islands for interactive bits (globe, forms), and **lightningcss** for CSS. Static-content-heavy with a few server actions.

## Stack

- **Astro 7.1** (`output: "server"`), `@astrojs/cloudflare` adapter, React islands via `@astrojs/react`. ADR 0001 for the host, ADR 0011 for why content pages prerender anyway
- **Contentful** delivery/preview API (`contentful`, rich-text renderers). ADR 0002
- **Drizzle ORM** + `@libsql/client` → **Turso** (migrated off Astro DB; env vars still named `ASTRO_DB_*`). ADR 0003
- **Effect 3** — `Context.Tag` + `Layer` clients for cms/db/email. ADR 0004
- **lightningcss** CSS transformer; **GSAP**, `react-globe.gl`/`three` (globe), `react-hook-form`, `resend` (email), reCAPTCHA v3, `vanilla-cookieconsent`
- **Biome** (lint + format), **Vitest** (unit), **Playwright** (e2e), **semantic-release** + commitlint (conventional commits)

## Versions (pinned by hand — not enforced by the docs test, since routine dependency bumps would break CI on it)

- Node **26.5.1** (`engines.node`)
- pnpm **11.15.1** (`packageManager`) — always use pnpm, never npm/yarn

## Commands

```bash
pnpm start            # astro dev, no browser — what Playwright's webServer boots
pnpm start:open       # pnpm start --open
pnpm build            # astro build
pnpm preview          # astro preview
pnpm wrangler:dev     # build + wrangler dev --remote (real Workers runtime)
pnpm deploy           # wrangler deploy --env production

pnpm check            # astro check (astro/tsx type + template check)
pnpm lint:ts:typecheck# tsc --noEmit
pnpm lint:all         # biome lint (append :fix to autofix)
pnpm format:all       # biome check --write

pnpm test:ut          # vitest (unit)
pnpm test:docs        # docs ⟷ code consistency alone (also runs inside test:ut)
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
  pages/              # routes (index, about, contact, projects, articles/index, articles/[...slug], tags/index, tags/[slug], privacy-policy, terms-and-conditions, rss.xml.ts, 404, 500)
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
  const/ data/
```

Unit tests are co-located with the code they cover (`src/**/*.test.ts`, and `src/**/*.test.tsx` for the React islands); the one test covering no single module is `docs/docs-consistency.test.ts`, colocated with the docs it checks — see the maintenance contract below. `testing/doubles/` holds the stub layers, virtual-module doubles and MSW network doubles those co-located tests import — ADR 0017 sets the rule for which of the three a given dependency gets, and `testing/setup/` starts the MSW server for the node project. All are picked up by `vitest.config.ts`, which resolves the path aliases and Astro’s `astro:*` virtual modules itself rather than through `getViteConfig` — ADR 0016 records why that is forced, and which modules it leaves unreachable from a unit test. Playwright specs live in the `testDir` declared in `playwright.config.ts`.

Path aliases (`tsconfig.json`): `@const/* @infrastructure/* @domain/* @actions/* @application/* @modules/* (→ src/ui/modules) @utils/* @assets/* (→ src/ui/assets) @styles/* (→ src/ui/styles) @data/* @shared/* @content/* @testing/* (→ testing)`. Prefer aliases over relative paths.

**Nested guides** — read the one for the folder you're touching, they carry the detail this file deliberately omits:

| Folder | Covers |
| --- | --- |
| [`src/domain/`](./src/domain/CLAUDE.md) | per-concept `schema`/`types`/`rules` layout, purity rules |
| [`src/application/`](./src/application/CLAUDE.md) | ACL: DTO mappers, collection loaders, adding a content type |
| [`src/infrastructure/`](./src/infrastructure/CLAUDE.md) | Effect clients, tagged errors, `runCms` vs `ContactLayer`, secrets |
| [`src/actions/`](./src/actions/CLAUDE.md) | The contact action: error→HTTP mapping, step order, the two email forms |
| [`src/ui/styles/`](./src/ui/styles/CLAUDE.md) | `@layer` order, token system, colour scheme, page containers |
| [`src/ui/modules/`](./src/ui/modules/CLAUDE.md) | component/CSS co-location, islands, data access |

## Conventions

- **Design tokens over magic numbers**, and respect the CSS `@layer` order — cascade correctness depends on it. Details in [`src/ui/styles/CLAUDE.md`](./src/ui/styles/CLAUDE.md).
- **Evergreen / Chromium-forward CSS.** Modern features are used freely (`light-dark()`, `interpolate-size`, `color-mix`, oklch); the build target is `esnext`.
- **No code comments.** Rationale belongs in commit messages / PRs / memory, not inline.
- **No Biome suppressions.** Fix the root cause (e.g. reorder selectors) instead of `biome-ignore`; suppress only if truly irreplaceable. Biome: 120 line width, `noConsole` error with no allowlist — no `console` at all, log through Effect's `Logger` (`Effect.logError`) — organizeImports on. `noConsole` is *not* part of Biome's recommended preset, so deleting that entry does not tighten it, it silently turns the rule off. `src/data/**` and `public/**` are excluded from Biome.
- **Conventional commits** (commitlint + husky). semantic-release owns versioning. Do NOT add a Co-Authored-By / Claude trailer to commits or PRs.

## Maintenance contract

These documents are not generated. A change that does not update them leaves the tree describing code that no longer exists, so when you change code, update the docs **in the same commit** — a follow-up commit is a promise, not a fix.


`docs/docs-consistency.test.ts` makes the mechanical half of that contract executable: it reads these documents and asserts every checkable claim against the repo — scripts, aliases, the folder tree, the route list, env vars, cited paths, links, ADR numbering/template/references, the client/layer/stylesheet tables, the Gotchas invariants. It also holds the nested guides to the *behaviour* they promise — lazy secret reads, `Effect.die` on irrecoverable misconfiguration, tagged errors declared in one file, domain and DTO purity, the loader procedure, CSS source order — and to the constants they quote, derived from the source rather than repeated, so an assertion breaks both when the constant moves and when the sentence citing it is deleted. It runs with `pnpm test:ut` (so, in CI on every PR). A failure means the docs and the code disagree — fix whichever one is wrong, and when the deliberate answer is "the doc leaves this out on purpose", say so in the allowlist at the top of that file rather than deleting the assertion. It still cannot check rationale — why a decision was made, whether an explanation is honest — and that part is on you. ADR 0015 records why it exists and what it costs — the markdown shape of these documents is parsed, so reformatting one can fail the build.

| If you change | Update |
| --- | --- |
| What a domain word means, or introduce a new one | [`CONTEXT.md`](./CONTEXT.md) — the glossary, vocabulary only |
| A folder's layout, the files a concept is made of, or a rule its guide states | that folder's nested `CLAUDE.md` (table above) |
| A behaviour a doc states as an invariant or a gotcha | that bullet, or delete it if it stopped being true |
| An env var | `env.schema` in `astro.config.ts`, `.env.example`, and the Gotchas bullet if it has one |
| A package script, a path alias, or the folder tree | the *Commands* / *Structure & aliases* sections here |
| The layer boundaries, the rendering mode, or the deploy target | the *Stack* / *Deploy* sections here, plus the ADR that decided it |
| A decision an ADR records | that ADR — amend it, or supersede it with a new one and say so in both `## Status` blocks |
| A claim `docs/docs-consistency.test.ts` asserts, on purpose | the doc first; the test only when the claim itself is what changed |

Propose an ADR in [`docs/adr/`](./docs/adr/) when a decision is **hard to reverse**, **surprising without context** and **the result of a real trade-off**. All three, or it is not an ADR. Copy [ADR 0000](./docs/adr/0000-adr-template.md), the template, and number it one above the highest existing file (`NNNN-kebab-title.md`, `# N. Title` / `Date:` / `## Status` / `## Context` / `## Decision` / `## Consequences`), then link it from wherever it bites — a Gotchas bullet here, a nested guide, a `CONTEXT.md` entry. There is no separate index; an ADR nothing links to will not be read, which is why both the template and the incoming link are asserted.

Two traps worth naming, because both have already happened here: deleting a resolved entry from a "known inconsistencies" or gotchas list is part of the fix, not tidying to do later; and a `file.ts:123` citation silently rots the moment anything above it moves — prefer naming the symbol.

## Gotchas

- **`light-dark()` in prod:** lightningcss downlevels it into a polyfill that breaks nested `color-scheme` inversion in production (dev looks fine). `Features.LightDark` stays in `lightningcss.exclude` in `astro.config.ts`; `errorRecovery: true` is also set. ADR 0006, and [`src/ui/styles/CLAUDE.md`](./src/ui/styles/CLAUDE.md).
- **`astro dev` hangs / SSR 500s / blank globe:** usually `.vite` cache thrash from running `astro check` or a second `astro dev` beside a live dev server (orphans deps chunks: `effect.js` → 500, `three`/`react-globe.gl` → blank). Fix: stop all dev processes, delete `node_modules/.vite`, restart.
- **`HIDE_CHROME`** (public boolean env) does more than its name says. It hides the header and the article breadcrumbs, and in `BaseLayout.astro` it *replaces the page body* with an under-construction placeholder on every route outside the article / tag / legal / error allowlist — so `/`, `/about`, `/contact` and `/projects` serve no real content at all. The footer still renders either way. It is **`true` in the `development` environment**, which is why the PR preview is not a faithful target: e2e coverage there is limited to what survives it. Referenced in `ui/modules/core/components/baseLayout/BaseLayout.astro`, `articles/[...slug].astro`, the astro.config env schema, and the deploy workflow.
- **Safari/WebKit loads nothing in dev:** the CSP carries `upgrade-insecure-requests`, and WebKit obeys it on `localhost` — every module script, font and `@vite/client` request is rewritten to `https://localhost:4321`, which the dev server does not speak, so the page renders inert with no JS at all. Chromium exempts localhost, so this is invisible there and only shows in Safari and Playwright's `webkit` project. `src/middleware.ts` strips that one directive when `import.meta.env.DEV`; production keeps it. Don't fold it back into `securityHeaders.ts` unconditionally.
- **Turso env naming:** DB env vars are `ASTRO_DB_REMOTE_URL` / `ASTRO_DB_APP_TOKEN` despite the project no longer using Astro DB. Schema: `src/infrastructure/db/schema.ts`; migrations in `drizzle/`. ADR 0003 explains why they keep the name.
- **Analytics are consent-gated:** GA/GTM load with `analytics_storage` denied until the visitor accepts the `analytics` category, set by an inline script in `<head>` before either initialises. Nothing in the code makes the requirement visible, so do not reorder or "clean up" that script. ADR 0013.
- **Image CDN switches by env:** Cloudflare image service in production build, Contentful/passthrough otherwise (`CLOUDFLARE_ENV === "production"` in astro.config → adapter `imageService`).
- **SSR externals:** `node:async_hooks` and `contentful` are externalized for SSR; the DB uses `@libsql/client/web` + `drizzle-orm/libsql/web`; `nodejs_compat` flag is enabled in `wrangler.toml`.

## Deploy

Cloudflare Workers via wrangler (`wrangler.toml`): `main` is the `@astrojs/cloudflare` server entrypoint, `dist/` served as assets, `SESSION` KV binding, custom domain `biancafiore.me` on `env.production`. CI/CD runs through GitHub Actions workflows. The host and the runtime constraints it imposes are ADR 0001; content pages are prerendered and only dynamic paths hit the SSR runtime, ADR 0011.

**A long commit message breaks the deploy, and the error does not say so.** `wrangler deploy` sends the latest commit message verbatim as the `workers/message` deployment annotation, with no truncation. Past a few thousand characters the API answers `Received a malformed response from the API` — a build that compiled fine, uploaded fine, and then died on metadata. A merge commit carrying a long pull request body is enough. `_deploy.yml` therefore passes `--message` explicitly with the sha and the trigger, so nothing about how a commit is written can reach that annotation.
