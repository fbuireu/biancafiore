# CLAUDE.md

Agent-facing guide for **biancafiore**, the portfolio/blog of a content writer. See [CONTEXT.md](./CONTEXT.md) for the domain glossary (article/project/testimonial/tag terminology, `isRepublished`/`originalSource`, etc.); do not duplicate it here.

## What this is

Astro **SSR** site deployed to **Cloudflare Workers**. Content comes from **Contentful** (CMS), dynamic data (contact submissions) from **Drizzle + libSQL/Turso**. Uses **Effect** for infrastructure clients, **React** islands for interactive bits (globe, forms), and **lightningcss** for CSS. Static-content-heavy with a few server actions.

## Stack

- **Astro** (`output: "server"`), `@astrojs/cloudflare` adapter, React islands via `@astrojs/react`. ADR 0001 for the host, ADR 0011 for why content pages prerender anyway
- **Contentful** delivery/preview API (`contentful`, rich-text renderers). ADR 0002
- **Drizzle ORM** + `@libsql/client` → **Turso** (migrated off Astro DB; env vars still named `ASTRO_DB_*`). ADR 0003
- **Effect**: `Context.Tag` + `Layer` clients for cms/db/email. ADR 0004
- **lightningcss** CSS transformer; **GSAP**, `react-globe.gl`/`three` (globe), `react-hook-form`, `resend` (email), reCAPTCHA v3, `vanilla-cookieconsent`
- **Biome** (lint + format), **Vitest** (unit), **Playwright** (e2e), **semantic-release** + commitlint (conventional commits)

## Versions

- Node (`engines.node`, and `.nvmrc`, which is what every CI job installs from)
- pnpm (`packageManager`, which `pnpm/action-setup` reads): always use pnpm, never npm/yarn

**This section names where each runtime is pinned and never what the pin says**, and the two failures that led here are worth keeping. Asserting the digit against the manifest fails every bot pull request on a documentation line the bot cannot edit, which is what contribKit did until it stopped. Quoting the digit without asserting it rots, which is what this section did: it said Node 26.5.1 and pnpm 11.15.1 for a while after the manifest had moved. Read `engines.node` or `.nvmrc`.

What *is* asserted is the part a bump cannot rot: each runtime is pinned exactly once. `.nvmrc` and `engines.node` are the same fact written twice and must agree, and no workflow may pin either a second time, since `prepare-env` reads `node-version-file: .nvmrc` and `pnpm/action-setup` reads `packageManager`. A bot that bumps the manifest moves both together, so those rules never fire on a routine update. A last rule reaches the sentences this section cannot see: no document outside the ADRs names a runtime or a framework beside a version, and the two lines here that narrate the stale digits by number are allow-listed by name, because history is not a claim about the tree.

## Commands

```bash
pnpm dev              # astro dev, no browser (what Playwright's webServer boots)
pnpm dev:open         # pnpm dev --open
pnpm build            # astro build
pnpm preview          # astro preview
pnpm wrangler:dev     # build + wrangler dev --remote (real Workers runtime)
pnpm deploy           # wrangler deploy --env production

pnpm check            # astro check (astro/tsx type + template check)
pnpm typecheck        # astro sync && tsc --noEmit
pnpm lint:all         # biome lint (append :fix to autofix)
pnpm format:all       # biome check --write
pnpm format:check     # biome check, no writes (what verify runs)
pnpm verify           # format:check && typecheck && check && test:ut:coverage (the CI gate and pre-push)

pnpm test:ut          # vitest (unit)
pnpm test:ut:watch    # vitest, watch mode
pnpm test:ut:coverage # vitest --coverage
pnpm test:docs        # docs ⟷ code consistency alone (also runs inside test:ut)
pnpm test:built       # build, then assert the emitted HTML, sitemap, feed and headers
pnpm test:e2e         # playwright
pnpm test:all         # unit + e2e

pnpm db:generate      # drizzle-kit generate (migrations)
pnpm db:migrate       # apply migrations
pnpm db:push          # push schema to Turso
pnpm db:studio        # drizzle studio
```

`--pass-with-no-tests` belongs to `test:e2e:changed`, not to `test:e2e`. That variant is `--only-changed`, which matches nothing whenever the working tree touches no spec, the common case, so without the flag it would fail almost every time; on `test:e2e` the same flag would only hide a broken `testDir` or an emptied `e2e/`, which is why it is not there. **No workflow runs it**, and the sentence here used to say a manual `end-2-end-tests.yml` did, on every event bar `workflow_dispatch`. That workflow answered `workflow_dispatch` and nothing else, so the ternaries selecting between the two commands and between two URLs each had one reachable branch; the ternaries went first, with the `E2E_SELF_HOSTED_URL` repository variable the dead branch read, and the workflow itself went next: nothing ever dispatched it, no sibling repository has an equivalent, and the only production run that matters is the `smoke` job below. `test:e2e:changed` stays as a local command, like `lint:changed`, `format:changed` and `test:ut:changed`, none of which CI runs either.

Env: copy [`.env.example`](./.env.example). Local secrets go in `.dev.vars` (loaded by [`drizzle.config.ts`](./drizzle.config.ts) and wrangler). Env schema is declared/validated in [`astro.config.ts`](./astro.config.ts) (`env.schema`); add new vars there.

## Structure & aliases

The layout is a **DDD-ish** layered architecture: every layer points inward at `domain/`, which imports nothing outward. The chain is shorter than the folder names suggest, and [`content.config.ts`](./src/content.config.ts) is the tree's **only** importer of `application/`: a page reads content through `astro:content`, never through a loader. The "-ish" is a stated split, not a hedge. [ADR 0012](./docs/adr/0012-pragmatic-ddd-domain-layer-anti-corruption-layer.md) names which practices it keeps (the ubiquitous language [`CONTEXT.md`](./CONTEXT.md) holds, the bounded context's anti-corruption layer, the dependency rule) and which it drops (aggregates, repositories, domain events, framework-free types), each with the reason; [ADR 0019](./docs/adr/0019-three-questions-before-modelling.md) decides how much of a concept earns a type of its own.

```
src/
  pages/              # routes (index, about, contact, projects, articles/index, articles/[...slug], tags/index, tags/[slug], privacy-policy, terms-and-conditions, rss.xml.ts, 404, 500)
  actions/            # Astro server actions (contact form → Effect ContactLayer)
  content.config.ts   # content collections wired to @application/entities
  middleware.ts       # sets SECURITY_HEADERS on every response
  domain/              # DDD domain layer: per-concept models (schema.ts/types.ts) + pure rules (rules.ts). See ADR 0012
  application/         # anti-corruption layer: entities/* loaders + dto/*DTO.ts Contentful mappers (call domain rules)
  shared/              # cross-cutting ui/utils + generic helpers (slugify, formatDate, groupBy)
  infrastructure/     # cms/ db/ email/ clients (Effect), cms/entries.ts, images/, integrations/, layers.ts, errors.ts
  ui/
    modules/          # feature areas: home, about, article(s), contact, projects, legal, core
    styles/           # global CSS layer stack + design tokens
    assets/           # images, svg-components (React)
  tests/              # doubles + MSW setup the co-located unit tests import; never collected as tests
  const/
```

Unit tests are co-located with the code they cover (`src/**/*.test.ts`, and `src/**/*.test.tsx` for anything needing a DOM: the React islands and the browser-only modules beside them, such as the header's `backgroundObserver`, because the extension is what selects vitest's `dom` project); the one test covering no single module is [`docs/docs-consistency.test.ts`](./docs/docs-consistency.test.ts), colocated with the docs it checks; see the maintenance contract below.

**A test co-located under [`src/pages`](./src/pages) carries a leading underscore, and that is not decoration.** Astro routes every file in that folder, so a co-located test beside the feed route would be a public URL serving vitest, and the docs test says so on the spot: it walks `src/pages` for route files and fails on any it cannot find in the route list above. The underscore is what both of them skip, which is the same prefix `_404.css` and `_500.css` already use, so [`_rss.xml.test.ts`](./src/pages/_rss.xml.test.ts) sits beside the route it covers and reaches no reader. It is the only test in that folder; anything else there needs the same prefix. [`src/tests/doubles/`](./src/tests/doubles) holds the stub layers, virtual-module doubles and MSW network doubles those co-located tests import; ADR 0017 sets the rule for which of the three a given dependency gets, and [`src/tests/setup/`](./src/tests/setup) starts the MSW server for the node project. All are picked up by [`vitest.config.ts`](./vitest.config.ts), which resolves the path aliases and Astro’s `astro:*` virtual modules itself rather than through `getViteConfig`; ADR 0016 records why that is forced, and which modules it leaves unreachable from a unit test. Playwright specs live in the `testDir` declared in [`playwright.config.ts`](./playwright.config.ts).

Path aliases ([`tsconfig.json`](./tsconfig.json)): `@const/* @infrastructure/* @domain/* @actions/* @application/* @modules/* (→ src/ui/modules) @assets/* (→ src/ui/assets) @styles/* (→ src/ui/styles) @shared/* @tests/* (→ src/tests)`. Prefer aliases over relative paths.

**Nested guides**. Read the one for the folder you're touching; they carry the detail this file deliberately omits:

| Folder | Covers |
| --- | --- |
| [`src/domain/`](./src/domain/CLAUDE.md) | per-concept `schema`/`types`/`rules` layout, purity rules |
| [`src/application/`](./src/application/CLAUDE.md) | ACL: DTO mappers, collection loaders, adding a content type |
| [`src/infrastructure/`](./src/infrastructure/CLAUDE.md) | Effect clients, tagged errors, `fetchEntries` vs `ContactLayer`, secrets |
| [`src/actions/`](./src/actions/CLAUDE.md) | The contact action: error→HTTP mapping, step order, the two email forms |
| [`src/ui/styles/`](./src/ui/styles/CLAUDE.md) | `@layer` order, token system, colour scheme, page containers |
| [`src/ui/modules/`](./src/ui/modules/CLAUDE.md) | component/CSS co-location, islands, data access |

## Conventions

- **Design tokens over magic numbers**, and respect the CSS `@layer` order; cascade correctness depends on it. Details in [`src/ui/styles/CLAUDE.md`](./src/ui/styles/CLAUDE.md).
- **Evergreen / Chromium-forward CSS.** Modern features are used freely (`light-dark()`, `interpolate-size`, `color-mix`, oklch); the build target is `esnext`.
- **One module spells a content URL.** [`@const/routes.ts`](./src/const/routes.ts) turns a Slug into a path (`articleHref`, `tagHref`, `projectHref`), and `absoluteUrl` folds in the origin: it is the tree's only reader of `SITE_URL`, so a canonical URL and a JSON-LD URL cannot disagree about where the site lives. Never concatenate `PAGES_ROUTES` with a slug; the table itself stays for the routes that address a whole page, and because `getPage` classifies the current URL against its keys.
- **One argument is positional; two or more are one object, typed `<FunctionName>Params`.** `securityHeaders(isDevelopment)`, `createBreadcrumbs(currentPath)`, `siteChrome(url)`; `isWithin({ pathname, route }): IsWithinParams`, `withImagePlaceholders({ field, entries }): WithImagePlaceholdersParams`. The type is named after the function, not after the concept, so a reader landing on the type knows what takes it. A test-only override is not a second argument: `siteChrome` used to take `isChromeHidden` so a test could vary it, and the test mocks `astro:env/client` instead.
- **No code comments.** Rationale belongs in commit messages / PRs / memory, not inline.
- **No Biome suppressions.** Fix the root cause (e.g. reorder selectors) instead of `biome-ignore`; suppress only if truly irreplaceable. Biome: 120 line width; `noConsole` error with no allowlist, meaning no `console` at all, log through Effect's `Logger` (`Effect.logError`); organizeImports on. `noConsole` is *not* part of Biome's recommended preset, so deleting that entry does not tighten it, it silently turns the rule off. `public/**` is excluded from Biome.
- **Conventional commits** (commitlint + husky). `pre-commit` formats staged files, `pre-push` runs `pnpm verify`. semantic-release owns versioning. Do NOT add a Co-Authored-By / Claude trailer to commits or PRs.

## Maintenance contract

These documents are not generated. A change that does not update them leaves the tree describing code that no longer exists, so when you change code, update the docs **in the same commit**: a follow-up commit is a promise, not a fix.


`docs/docs-consistency.test.ts` makes the mechanical half of that contract executable: it reads these documents and asserts every checkable claim against the repo: scripts, aliases, the folder tree, the route list, env vars, cited paths, links, ADR numbering/template/references, the client/layer/stylesheet tables, the Gotchas invariants. It also holds the nested guides to the *behaviour* they promise (lazy secret reads, `Effect.die` on irrecoverable misconfiguration, tagged errors declared in one file, domain and DTO purity, the loader procedure, CSS source order), and to the constants they quote, derived from the source rather than repeated, so an assertion breaks both when the constant moves and when the sentence citing it is deleted. It runs with `pnpm test:ut` (so, in CI on every PR). A failure means the docs and the code disagree: fix whichever one is wrong, and when the deliberate answer is "the doc leaves this out on purpose", say so in the allowlist at the top of that file rather than deleting the assertion. It still cannot check rationale (why a decision was made, whether an explanation is honest), and that part is on you. ADR 0015 records why it exists and what it costs: the markdown shape of these documents is parsed, so reformatting one can fail the build.

| If you change | Update |
| --- | --- |
| What a domain word means, or introduce a new one | [`CONTEXT.md`](./CONTEXT.md): the glossary, vocabulary only |
| A folder's layout, the files a concept is made of, or a rule its guide states | that folder's nested `CLAUDE.md` (table above) |
| A behaviour a doc states as an invariant or a gotcha | that bullet, or delete it if it stopped being true |
| An env var | `env.schema` in `astro.config.ts`, `.env.example`, and the Gotchas bullet if it has one |
| A package script, a path alias, or the folder tree | the *Commands* / *Structure & aliases* sections here |
| The layer boundaries, the rendering mode, or the deploy target | the *Stack* / *Deploy* sections here, plus the ADR that decided it |
| A decision an ADR records | that ADR: amend it, or supersede it with a new one and say so in both `## Status` blocks |
| A claim `docs/docs-consistency.test.ts` asserts, on purpose | the doc first; the test only when the claim itself is what changed |
| What a reader who is not editing this tree would see: the layers, the content model, what renders where, how a deploy works | the page it belongs to in [`docs/wiki/`](./docs/wiki), which is the only documentation a non-contributor reads |
| An item in [`docs/BACKLOG.md`](./docs/BACKLOG.md) ships, or is decided against | delete the entry: it is a list of what is *not* done, so a stale entry is a lie about the tree. An item that becomes a decision leaves as an ADR |

**[`docs/wiki/`](./docs/wiki) is published, and it is the shape rather than the rules.** [`sync-wiki.yml`](./.github/workflows/sync-wiki.yml) rsyncs it into the repository's GitHub wiki on every push to `main` that touches it, `--delete` included, so the wiki is a mirror and editing a page in the GitHub UI is a change the next sync throws away. The same workflow, byte for byte, publishes the sibling repositories' wikis. Three rules follow from where those pages end up, and the docs test asserts all three: a **filename is the page name** (`Getting-Started.md` is reachable as `Getting-Started`), a link to another page is that **bare name and never a path**, and a link into this repository is an **absolute `https://github.com/` URL**, because a wiki page has no relative route back into the tree. What a page must not do is restate a rule the tree already states: the normative statement lives beside the code, a wiki copy of it is a second one nothing checks, and the page's job is to say where it is.

Propose an ADR in [`docs/adr/`](./docs/adr/) when a decision is **hard to reverse**, **surprising without context** and **the result of a real trade-off**. All three, or it is not an ADR. Copy [ADR 0000](./docs/adr/0000-adr-template.md), the template, and number it one above the highest existing file (`NNNN-kebab-title.md`, `# N. Title` / `Date:` / `## Status` / `## Context` / `## Decision` / `## Consequences`), then link it from wherever it bites: a Gotchas bullet here, a nested guide, a [`CONTEXT.md`](./CONTEXT.md) entry. There is no separate index; an ADR nothing links to will not be read, which is why both the template and the incoming link are asserted.

Two traps worth naming, because both have already happened here: deleting a resolved entry from a "known inconsistencies" or gotchas list is part of the fix, not tidying to do later; and a `file.ts:123` citation silently rots the moment anything above it moves, so prefer naming the symbol.

## Gotchas

- **`light-dark()` in prod:** lightningcss downlevels it into a polyfill that breaks nested `color-scheme` inversion in production (dev looks fine). `Features.LightDark` stays in `lightningcss.exclude` in `astro.config.ts`; `errorRecovery: true` is also set. ADR 0006, and [`src/ui/styles/CLAUDE.md`](./src/ui/styles/CLAUDE.md).
- **`astro dev` hangs / SSR 500s / blank globe:** usually `.vite` cache thrash from running `astro check` or a second `astro dev` beside a live dev server (orphans deps chunks: `effect.js` → 500, `three`/`react-globe.gl` → blank). Fix: stop all dev processes, delete `node_modules/.vite`, restart.
- **`HIDE_CHROME`** (public boolean env) does more than its name says, so no component reads it: `siteChrome` in [`@modules/core/utils/siteChrome.ts`](./src/ui/modules/core/utils/siteChrome.ts) is the tree's only reader, and callers ask it `showsHeader`, `showsBreadcrumbs`, `showsTableOfContents` and `servesRealContent` instead. It hides the header, the breadcrumbs on every page that carries them, and an Article's table of contents, and it *replaces the page body* with an under-construction placeholder on every route outside the articles / tags / legal / error allowlist, so `/`, `/about`, `/contact` and `/projects` serve no real content at all. The footer still renders either way. It is **`true` in the `development` environment**, which is why the PR preview is not a faithful target: e2e coverage there is limited to what survives it. Outside that module the name appears only in the astro.config env schema and the deploy workflow. [ADR 0018](./docs/adr/0018-hide-chrome-replaces-the-page.md) records why the flag exists and what publishing a route means.
- **Safari/WebKit loads nothing in dev:** the CSP carries `upgrade-insecure-requests`, and WebKit obeys it on `localhost`: every module script, font and `@vite/client` request is rewritten to `https://localhost:4321`, which the dev server does not speak, so the page renders inert with no JS at all. Chromium exempts localhost, so this is invisible there and only shows in Safari and Playwright's `webkit` project. [`src/middleware.ts`](./src/middleware.ts) strips that one directive when `import.meta.env.DEV`; production keeps it. Don't fold it back into [`securityHeaders.ts`](./src/const/securityHeaders.ts) unconditionally.
- **Turso env naming:** DB env vars are `ASTRO_DB_REMOTE_URL` / `ASTRO_DB_APP_TOKEN` despite the project no longer using Astro DB. Schema: [`src/infrastructure/db/schema.ts`](./src/infrastructure/db/schema.ts); migrations in `drizzle/`. ADR 0003 explains why they keep the name.
- **Analytics are consent-gated:** GA/GTM load with `analytics_storage` denied until the visitor accepts the `analytics` category, set by an inline script in `<head>` before either initialises. Nothing in the code makes the requirement visible, so do not reorder or "clean up" that script. ADR 0013.
- **Image CDN switches by env:** Cloudflare image service in production build, Contentful/passthrough otherwise (`CLOUDFLARE_ENV === "production"` in astro.config → adapter `imageService`).
- **SSR externals:** `node:async_hooks` and `contentful` are externalized for SSR; the DB uses `@libsql/client/web` + `drizzle-orm/libsql/web`; `nodejs_compat` flag is enabled in [`wrangler.toml`](./wrangler.toml).

## Deploy

Cloudflare Workers via wrangler (`wrangler.toml`): `main` is the `@astrojs/cloudflare` server entrypoint, `dist/` served as assets, `SESSION` KV binding, custom domain `biancafiore.me` on `env.production`.

CI/CD runs through GitHub Actions:

| Workflow | Runs on | Does |
| --- | --- | --- |
| [`ci.yml`](./.github/workflows/ci.yml) | push to `main`, PRs, `workflow_dispatch` | A `Verify` job running `pnpm verify`, then both deploys, the E2E run against the preview, the production smoke run and the release, and a final `Check` job that aggregates all of them. A dispatch on `main` redeploys production with the smoke run behind it and cuts no release: the Worker secrets ride the deploy and the build inlines the public env, so a rotated credential reaches nothing until something redeploys, and rotation changes no file a push filter could see. The dispatch takes an optional `reason`, which becomes the run name |
| [`_deploy.yml`](./.github/workflows/_deploy.yml) | `workflow_call` | The shared deploy steps both environments call |
| [`cleanup-development.yml`](./.github/workflows/cleanup-development.yml) | PR closed; weekly schedule and `workflow_dispatch` | Deletes the per-PR preview Worker once that PR's CI run has finished; on the schedule, sweeps every `pr-*` Worker whose pull request is closed |
| [`publish-article.yml`](./.github/workflows/publish-article.yml) | Contentful webhook | Dispatches `ci.yml` on `main`, so a published Article redeploys production through the same smoke and rollback as a push |
| [`sync-wiki.yml`](./.github/workflows/sync-wiki.yml) | push to `main` touching `docs/wiki/**` | Publishes [`docs/wiki/`](./docs/wiki) to the repository's GitHub wiki |
| [`zizmor.yml`](./.github/workflows/zizmor.yml) | push to `main`, PRs | Security linting of the workflows themselves |
| [`dependency-review.yml`](./.github/workflows/dependency-review.yml) | PRs | Fails a PR that introduces a dependency with a known vulnerability |
| [`commit-message.yml`](./.github/workflows/commit-message.yml) | PR opened / edited / reopened / synchronize | commitlint on the **pull request title** |
| [`dependabot-auto-merge.yml`](./.github/workflows/dependabot-auto-merge.yml) | Dependabot PRs | Auto-merges the safe update types of the security updates GitHub raises; Renovate merges its own through the platform once `Check` is green |

**`commit-message.yml` guards the only message that survives.** `main` takes squash merges and the repository sets the squash title to `PR_TITLE`, so the pull request title *is* the commit semantic-release reads. The `commit-msg` hook validates the branch's own commits, which the squash then discards, and GitHub fills the PR title from the *branch name* whenever a PR carries more than one commit, so the default is rarely conventional. It re-runs on `synchronize` because a required check is evaluated against the head sha: without that trigger a new commit would leave it unreported and block the merge. The host and the runtime constraints it imposes are ADR 0001; content pages are prerendered and only dynamic paths hit the SSR runtime, ADR 0011.

**`smoke` is the only job that ever touches production, and until it existed nothing did.** `E2E (preview)` needs `deploy-development`, which runs on `pull_request` only, so a push to `main` deployed production, cut a tag and made no request to `https://biancafiore.me` at all. The preview is not a faithful target either: `HIDE_CHROME` is `true` in the `development` environment, so the suite that runs there sees the under-construction placeholder on `/`, `/about`, `/contact` and `/projects`. `smoke` needs `deploy-production`, runs Playwright with `BASE_URL` taken from the **`SITE_URL` repository variable**, the same one `_deploy.yml` hands the build, so the address is written once and a domain move does not leave a test pointed at the old one. It is the only job that speaks to production, so the address is named once, and `E2E_PRODUCTION_URL` is gone from the repository settings with `E2E_SELF_HOSTED_URL`. It has to be a **repository** variable, not an environment one: this job declares no `environment:` and therefore reads an empty string from an environment-scoped `vars`, which is how its first run failed. Declaring the environment here would fix the lookup and hand this job that environment's secrets and any approval rule protecting it, for a URL that is public. It sends no Cloudflare Access headers, which [`playwright.config.ts`](./playwright.config.ts) handles by sending none when neither variable is set, and it declares no `environment:` on purpose: production is public, so the job needs no secret and naming one would hand it secrets it has no use for. A first step fails the job when that variable is empty, because the config falls back to `LOCAL_URL` and a `webServer` when `BASE_URL` is unset: an unset variable would otherwise smoke-test a dev server booted on the runner and report green.

**Three cases in [`e2e/smoke.spec.ts`](./e2e/smoke.spec.ts) carry `@smoke` and the step passes no `--pass-with-no-tests`, which is the point.** Playwright exits 1 on an empty set, so the flag would make a typo in the grep green; without it, a grep that stops matching fails the job, which is the only thing that keeps the set honest. They are the cheapest things that prove the Worker is answering rather than merely deployed: the homepage with a non-empty title, an unknown path answering 404, and `robots.txt`. **That trio is the same in every repository that deploys**, written the same way and with the same titles, so a set that differs between them is drift rather than a decision; contribKit carries a fourth because `/user/<name>.svg` cannot be prerendered there and nothing else separates a running Worker from a bucket of assets. A smoke case can only assert what the deploy it follows has already published, which is why none of them names a feature: they check that the Worker routes and responds, and the feature coverage stays in the preview suite. They run against the preview too, since `test:e2e` runs the whole directory, and they survive `HIDE_CHROME` because none of them asserts page content.

**`/rss.xml` and `/sitemap-index.xml` answer `403` in production to a request from a datacenter address, and that is why they are not smoke cases.** Both were, on the first run of this job: the homepage, the 404 and `robots.txt` passed and those two failed with `403` under both browser projects, from a GitHub runner sending a real browser user agent. Nothing in this tree returns 403 (the middleware only sets headers), so the answer comes from the edge rather than from the Worker. **A browser gets both**, checked on 2026-08-29: the feed renders its channel and items, so the Worker serves them and the zone is answering the runner differently from a person. That is worth knowing beyond CI: a feed reader is also an automated client on a datacenter address, so the rule that failed the test may be refusing subscribers, and nothing here would show it. Cloudflare's **Security Events** log names the rule that blocked a given request, which is where a fix starts; the fix is a Cloudflare setting, not a change in this tree. Put the two cases back in the smoke set once that rule stops matching, since a smoke case that depends on the caller's address is evidence about the caller, not about the deploy.

**A CI run shows two Vitest summaries, and they are two different suites.** `vitest.config.ts` declares three
projects: `node` and `dom` are the unit suite, which `pnpm verify` runs in the `Verify` job, and `built` is the
handful of assertions over the emitted HTML, sitemap, feed and headers, which cannot run until something has been
built. That is why `_deploy.yml` runs `vitest run --project built` as its own step after the build, in the deploy
job, and why the run summary carries two reports rather than one. Neither is a duplicate of the
other, and `pnpm test:built` is the local command that builds and runs the second. Each block now says which
it is: the heading inside Vitest's `github-actions` reporter is a constant with no rename option, so
`vitest.config.ts` registers `summaryLabel`, a reporter that writes a *Vitest run: \<projects\>* heading above
its block from the names of the projects that actually ran, on CI only. The same labelling exists in
forever-pto and contribKit, each shaped to its own config.

**The smoke job labels its own report.** Playwright's `github` reporter annotates every run with the same
`🎭 Playwright Run Summary`, whichever suite produced it, so a step writes a *Production smoke tests* heading to
`$GITHUB_STEP_SUMMARY` first, naming the address it ran against and the sha it followed. The artifact is
`playwright-smoke-report` for the same reason.

**Playwright writes its HTML report on CI as well as its annotations.** The reporter used to be
`process.env.CI ? "github" : "html"`, so on a runner the only output was the inline annotation and the
`playwright-report/` directory never existed: both upload steps, in `e2e` and in `smoke`, warned *No files were
found with the provided path* on every run and uploaded nothing, including the runs that failed and were the whole
reason to have an artifact. It is `[["github"], ["html", { open: "never" }]]` on CI now, which keeps the annotation
and produces the directory with the traces in it. The sibling repositories now carry the same pair, for a
reason this one did not have: their smoke jobs print a step-summary line naming the *Playwright Run Summary*
annotation, and while they declared `reporter: "html"` alone that annotation was never emitted, so the line
pointed at output that did not exist.

**`smoke` gates `release`, and a failing one rolls production back.** A tag means the version is live *and
answering*, not merely that `wrangler deploy` exited zero, which is why `release` needs `deploy-production` and
`smoke`. On its own that leaves a bad version serving traffic with only the tag withheld, so `rollback` runs
`wrangler rollback --env production --yes` when `deploy-production` succeeded and `smoke` failed, returning the
Worker to the version that was live before. It is a separate job rather than a step in `smoke` because it needs the
Cloudflare credentials, and `smoke` deliberately declares no `environment:`; putting the rollback there would hand
every smoke run a token it has no use for.

**What that costs is worth stating.** The smoke set is small on purpose, but a case that fails for a reason outside
the Worker now reverts a deploy that was fine: the `403` below is exactly that shape, which is why those two paths
are not in the set. Keep it that way. A case whose result depends on the caller's address does not belong in a set
that can undo a release.

**The deploy names its wrangler environment on the command line, and it used to name it only by accident.** `wrangler.toml` puts the `SESSION` KV id and the `biancafiore.me` custom domain under `[env.production]`, and a different KV id under `[env.development]`, so which environment the deploy selects decides which namespace a preview writes to. `_deploy.yml` passed no `--env`; what selected it was `CLOUDFLARE_ENV`, which wrangler reads as an equivalent of the flag and which was declared at job level because the **build** needs it. That worked, and it meant the deploy's target was set by a variable named for something else, three screens away, with nothing saying so. The flag is explicit now, and the value is **derived** from the GitHub Environment rather than passed: `_deploy.yml` takes `environment` alone and reads the wrangler environment as its last dash-separated segment, so `production` and `development` here, `web-production` and `web-development` in the monorepos, and a caller cannot pair a GitHub Environment with the wrong wrangler one, which is the mistake a second `wrangler_env` input left open. The same step feeds `CLOUDFLARE_ENV` to the build.

**The Worker secrets ride the deploy, and a deploy is one version.** `_deploy.yml` writes the seven runtime secrets as JSON to a file under `$RUNNER_TEMP`, never inside the workspace where an artifact upload could sweep it up, hands it to `wrangler deploy --secrets-file`, and removes it in an `if: always()` step. It used to run `wrangler secret bulk` *after* the deploy, because a secret write needs the Worker to exist (`script_not_found [code: 10007]` on a Worker's first deploy), and that ordering is what made every deploy two versions with a window in between where the new code ran against the previous deploy's values. `--secrets-file` uploads them with the version, so the ordering problem stops existing rather than being worked around. It is additive, exactly like `secret bulk`: a secret the file omits is not deleted. The node preflight that refuses to write the file when one of the seven is empty is the whole reason the step exists as a step, and it now fails before anything is deployed rather than after.

**`Check` is the one context the ruleset requires, and it is an aggregate.** It needs `Verify`, both deploys, `E2E (preview)`, `Production smoke tests` and `Semantic Release`, runs under `always()`, and fails when any of them failed or was cancelled; a job skipped by its own `if:` counts as success, which is what lets a pull request pass without the `main` jobs and a push to `main` pass without the preview ones. That is what makes the preview E2E run a gate: `E2E (preview)` was not a required check, and Renovate merged pull request 1178 three seconds after `Verify` passed, while the suite was still driving the preview. Naming the E2E job directly in the ruleset would not have helped either, because a required check that never reports blocks the merge, and every job here is conditional on the event. The other required contexts come from workflows of their own: `Lint the pull request title`, `Dependency Review` and `zizmor`, the check run zizmor's action publishes through code scanning rather than the job that runs it, since the job passes whatever it finds. There is no approval requirement: the owner is the only reviewer and the checks are the gate, which is why `renovate-auto-approve.yml` is gone. Two settings outside that ruleset complete it, and nothing in the tree can assert either: a second ruleset, `release-tags`, forbids deleting or moving any `v*` tag (semantic-release creates them with the owner's `PAT`, which passes the admin bypass), and the `production` environment accepts deployments from `main` only, so a job that names it from any other ref fails before its first step.

**The cleanup queues behind the PR's own CI run, by pull request number.** `cleanup-development.yml` fires on `pull_request: closed`, and closing a pull request does not cancel the run already going, whose `E2E (preview)` job drives the Worker the cleanup deletes. It used to join `ci.yml`'s group as `CI-${{ github.ref }}`, on the assumption that a closed event carries the same `refs/pull/N/merge` as the open one. It does not: on a merged pull request that expression resolves to the base branch, so the cleanup joined the group of the push to `main` instead, ran while the preview E2E was still using the Worker (pull request 1178 lost 34 cases that way), and was cancelled whenever two merges came close together, because a group holds one pending run and the newer replaces the older; seven cleanups were cancelled in one week and left their Workers alive. The group is spelled from the number now, `CI-refs/pull/${{ github.event.pull_request.number }}/merge`, which is literally the group `ci.yml` computes for that pull request's run, and nothing else ever enters it. The coupling is still by `ci.yml`'s `name:`, `CI`, and `docs/docs-consistency.test.ts` asserts it. A second job in the same workflow, `sweep`, runs weekly and on dispatch: it lists the account's Workers through the Cloudflare API, keeps every `pr-<n>-biancafiore-development` whose pull request is still open, and deletes the rest, so a cleanup lost to a token or an outage does not leave a Worker behind for good.

**A run on `main` can be cancelled without anyone cancelling it.** `cancel-in-progress` is off for pushes, but a concurrency group holds one pending run: with one in progress, a second push waits, and a third replaces the second. The run that never started skips its deploy and its smoke, and the release that follows may carry the next sha rather than its own; semantic-release reads the whole history, so nothing is lost, but a `main` run reading *cancelled* is that and not a failure.

**Neither the build nor the deploy is wrapped in `nick-fields/retry`.** A wrapper cannot tell a bad argument from a bad network, and both of these fail deterministically far more often than they fail for a reason a second attempt fixes: the build carried `max_attempts: 3` with `timeout_minutes: 10`, so a type error or a bad env schema burned up to half an hour before reporting, and the deploy retried argv errors three times at fifteen-second intervals. Wrangler already retries its own API calls internally. The one real network flake in this build is Astro's font provider resolving a `fonts.gstatic.com` URL that then 404s, and a retry cannot fix that one either without clearing `node_modules/.astro/fonts` between attempts, which this one never did: it re-read the same dead URL three times. If it becomes a problem, clear that directory, do not restore a blanket wrapper.

**A long commit message breaks the deploy, and the error does not say so.** `wrangler deploy` sends the latest commit message verbatim as the `workers/message` deployment annotation, with no truncation. Past a few thousand characters the API answers `Received a malformed response from the API`: a build that compiled fine, uploaded fine, and then died on metadata. A merge commit carrying a long pull request body is enough. `_deploy.yml` therefore passes `--message` explicitly with the sha and the trigger, as one hyphenated token (`<sha>-<event>`), so nothing about how a commit is written can reach that annotation. The token has no spaces because the three repositories that deploy share the format, and forever-pto's OpenNext wrapper re-spawns wrangler through a shell that splits a message on them.
