# AGENTS.md

Agent-facing guide for **biancafiore**, the portfolio and blog of a content writer: an Astro SSR site on Cloudflare Workers, with content from Contentful and contact submissions in Turso. [GLOSSARY.md](./GLOSSARY.md) is the domain glossary; do not duplicate it here.

Reviewing a diff: [CODING_STANDARDS.md](./CODING_STANDARDS.md).

## Stack

- **Astro** (`output: "server"`) on the `@astrojs/cloudflare` adapter, React islands via `@astrojs/react`. ADR 0001 for the host, ADR 0011 for why content pages prerender anyway
- **Contentful** delivery and preview APIs, read through `fetchEntries` alone. ADR 0002
- **Drizzle ORM** + `@libsql/client` on **Turso**, whose env vars keep their Astro DB names (Gotchas). ADR 0003
- **Effect** for the cms, db and email clients, and the `LoggerService` tag over the `logger` whose `write` fixes the shape of a log line. ADR 0004, ADR 0020

## Versions

- Node (`engines.node`, and `.nvmrc`, which is what every CI job installs from)
- pnpm (`packageManager`, which `pnpm/action-setup` reads): always use pnpm, never npm/yarn

This section names where each runtime is pinned and never what the pin says: read `engines.node` or `.nvmrc`. Each runtime is pinned once: `.nvmrc` and `engines.node` must agree, no workflow pins either again, and no document outside the ADRs names a runtime or a framework beside a version. `pnpm test:docs` asserts all three.

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
pnpm verify:static    # format:check && typecheck && check: everything verify does but the suite
pnpm verify           # verify:static && test:ut:coverage (the CI gate)
pnpm verify:changed   # verify:static && test:ut:changed && test:docs (what pre-push runs)

pnpm test:ut          # vitest, the node and dom projects
pnpm test:ut:watch    # the same, in watch mode
pnpm test:ut:coverage # test:ut --coverage
pnpm test:docs        # docs ⟷ code consistency alone (also runs inside test:ut)
pnpm test:built       # build, then assert the emitted HTML, sitemap, feed and headers
pnpm test:e2e         # playwright
pnpm test:all         # unit + e2e

pnpm db:generate      # drizzle-kit generate (migrations)
pnpm db:migrate       # apply migrations
pnpm db:push          # push schema to Turso
pnpm db:studio        # drizzle studio
```

`test:ut:changed` picks tests through the import graph, and neither a Markdown file nor a stylesheet the docs test reads is in it, which is why `verify:changed` ends with `test:docs`. The hooks: `pre-commit` formats staged files, `commit-msg` runs commitlint, `pre-push` runs `pnpm verify:changed`, and CI runs the full `pnpm verify`; [CONTRIBUTING.md](./.github/CONTRIBUTING.md) says why the hook stops short of it.

`--pass-with-no-tests` belongs to `test:e2e:changed` alone, and the docs test holds it there: its `--only-changed` set is empty whenever no spec changed, while on `test:e2e` or on the smoke step the flag would turn a broken `testDir` or a grep that stopped matching green.

A `package.json` script runs under `cmd` on Windows, which passes `$(...)` through as literal text, so a `:changed` variant names a literal base (`origin/main`) and the docs test rejects a substitution. Biome's `--changed` diffs against `vcs.defaultBranch`, which is `main`, so on `main` `pnpm format:changed` answers *Checked 0 files*: reach for `format:all` there.

Env: copy [`.env.example`](./.env.example). Local secrets go in `.dev.vars` (loaded by [`drizzle.config.ts`](./drizzle.config.ts) and wrangler). The env schema is declared and validated in [`astro.config.ts`](./astro.config.ts) (`env.schema`); add new vars there.

## Structure & aliases

The layout is a **DDD-ish** layered architecture: every layer points inward at `domain/`, which imports nothing outward, and [`content.config.ts`](./src/content.config.ts) is the tree's **only** importer of `application/`: a page reads content through `astro:content`, never through a loader. [ADR 0012](./docs/adr/0012-pragmatic-ddd-domain-layer-anti-corruption-layer.md) names which DDD practices the tree keeps and which it drops, each with the reason; [ADR 0019](./docs/adr/0019-three-questions-before-modelling.md) decides how much of a concept earns a type of its own.

```
src/
  pages/              # routes (index, about, contact, projects, articles/index, articles/[...slug], tags/index, tags/[slug], privacy-policy, terms-and-conditions, rss.xml.ts, 404, 500)
  actions/            # Astro server actions (contact form → Effect ContactLayer)
  content.config.ts   # content collections wired to @application/entities
  middleware.ts       # securityHeaders on what the Worker renders; prerendered pages take the same set from public/_headers
  domain/              # DDD domain layer: per-concept models (schema.ts/types.ts) + pure rules (rules.ts). See ADR 0012
  application/         # anti-corruption layer: entities/* loaders + dto/*DTO.ts Contentful mappers (call domain rules)
  shared/              # cross-cutting ui/utils + generic helpers (slugify, deSlugify, formatDate, escapeHtml, safeUrl)
  infrastructure/     # cms/ db/ email/ logging/ clients (Effect), cms/entries.ts, utils/, images/, integrations/, layers.ts, errors.ts
  ui/
    modules/          # feature areas: home, about, article(s), contact, projects, legal, core
    styles/           # global CSS layer stack + design tokens
    assets/           # images, svg-components (React)
  tests/              # doubles, helpers + MSW setup the co-located unit tests import; never collected as tests
  const/              # the route table, site constants and security headers
```

Unit tests are co-located with the code they cover: `src/**/*.test.ts` and `e2e/previewAccess.test.ts`, and `src/**/*.test.tsx` for anything needing a DOM (the React islands and the browser-only modules beside them, such as the header's `backgroundObserver`), because the extension is what selects vitest's `dom` project. The tests covering no single module sit in `docs/`: [`docs/docs-consistency.test.ts`](./docs/docs-consistency.test.ts), which holds the documents to the code (maintenance contract below), and [`docs/built-output.test.ts`](./docs/built-output.test.ts), the `built` project, which needs a build first. Coverage has a floor on every metric, one `MIN_THRESHOLD` in [`vitest.config.ts`](./vitest.config.ts), the same shape and number as the sibling repositories'.

**A test co-located under [`src/pages`](./src/pages) carries a leading underscore** ([`_rss.xml.test.ts`](./src/pages/_rss.xml.test.ts)): Astro routes every other file in that folder, so without it the test would be a public URL, and the docs test fails on a route file the route list above does not name.

[`src/tests/doubles/`](./src/tests/doubles) holds the stub layers, virtual-module doubles and MSW network doubles the co-located tests import, ADR 0017 decides which one a dependency gets, [`src/tests/helpers/`](./src/tests/helpers) holds what tests share that is no double (`failureOf` and `defectOf`, which read the typed failure or the defect off an Effect `Exit`), and [`src/tests/setup/`](./src/tests/setup) starts the MSW server for the `node` and `dom` projects. [`vitest.config.ts`](./vitest.config.ts) resolves the path aliases and Astro’s `astro:*` virtual modules itself rather than through `getViteConfig`; ADR 0016 records why that is forced, and which modules it leaves unreachable from a unit test. Playwright specs live in the `testDir` declared in [`playwright.config.ts`](./playwright.config.ts), which matches `*.spec.ts` alone so `e2e/previewAccess.test.ts` stays vitest's, and every one runs in its `chromium` and `webkit` projects, locally and in CI alike, so a local run needs both browsers (`pnpm exec playwright install chromium webkit`). Every spec takes `test` and `expect` from [`e2e/fixtures.ts`](./e2e/fixtures.ts), never from `@playwright/test`: with `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET` set, as the run against the preview sets them, it adds the Cloudflare Access service token as `CF-Access-Client-Id` and `CF-Access-Client-Secret` to the requests whose origin is the `baseURL`'s and to the `request` fixture, and to nothing a third party serves; with neither set it adds nothing, and with one alone it throws. The check on the two variables, the origin test and the header merge are [`e2e/previewAccess.ts`](./e2e/previewAccess.ts), unit-tested beside it. No config sets `extraHTTPHeaders`, because Playwright sends those on every request a page makes, Tag Manager and Calendly included.

Path aliases ([`tsconfig.json`](./tsconfig.json)): `@const/* @infrastructure/* @domain/* @application/* @modules/* (→ src/ui/modules) @assets/* (→ src/ui/assets) @styles/* (→ src/ui/styles) @shared/* @tests/* (→ src/tests)`. An import that leaves its layer or feature takes the alias and one that stays inside it is relative; `src/actions` has no alias, since nothing outside it imports from it.

**Nested guides**. Read the one for the folder you're touching; they carry the detail this file deliberately omits:

| Folder | Covers |
| --- | --- |
| [`src/domain/`](./src/domain/AGENTS.md) | per-concept `schema`/`types`/`rules` layout, what the domain may import |
| [`src/application/`](./src/application/AGENTS.md) | ACL: DTO mappers, collection loaders, adding a content type |
| [`src/infrastructure/`](./src/infrastructure/AGENTS.md) | Effect clients, tagged errors, `fetchEntries` vs `ContactLayer`, secrets |
| [`src/actions/`](./src/actions/AGENTS.md) | The contact action: error→HTTP mapping, step order, the two email forms |
| [`src/ui/styles/`](./src/ui/styles/AGENTS.md) | `@layer` order, token system, colour scheme, page containers |
| [`src/ui/modules/`](./src/ui/modules/AGENTS.md) | component/CSS co-location, islands, data access |

## Conventions

- **One argument is positional; two or more are one object**, typed `<FunctionName>Params`, or one type named for the role when sibling functions take the same input: `siteChrome(url)`, `isWithin({ pathname, route }: IsWithinParams)`. A parameter object never holds a single field, so `siteChrome({ url })` is not the shape, and a signature the runtime or a vendor owns keeps its owner's type.
- **One module spells a content URL.** [`@const/routes.ts`](./src/const/routes.ts) turns a Slug into a path (`articleHref`, `tagHref`) and a Project's `id` into an anchor on `/projects` (`projectHref`), and `absoluteUrl` folds in the origin: it is the only reader of `SITE_URL` under `src`, and `astro.config.ts` hands the same variable to Astro's `site`, which the sitemap and the feed use (read through `loadEnv`, see Gotchas), so a canonical URL, a JSON-LD URL, the sitemap and the feed cannot disagree about where the site lives. `PAGES_ROUTES` stays for the routes that address a whole page, and because `getPage` classifies the current URL against its keys.
- **No comments** in hand-written source, doc comments included, bar the tool directives `biome-ignore`, `@ts-expect-error` and `/// <reference`. The reason for a line goes in the commit message, the pull request, an ADR or [CODING_STANDARDS.md](./CODING_STANDARDS.md).
- `pnpm test:docs` fails on a breach of any of the three.
- Biome: 120 line width, `public/**` excluded, organizeImports on. `noConsole` is an error everywhere but the log transport, `@infrastructure/logging/logger.ts`, and it is not part of Biome's recommended preset, so deleting that entry turns the rule off rather than tightening it.
- **Conventional commits** (commitlint + husky). semantic-release owns versioning. Do NOT add a Co-Authored-By / Claude trailer to commits or PRs.

## Maintenance contract

These documents are not generated. When you change code, update the docs **in the same commit**: a follow-up commit is a promise, not a fix.

[`docs/docs-consistency.test.ts`](./docs/docs-consistency.test.ts) holds these documents, [CODING_STANDARDS.md](./CODING_STANDARDS.md) included, to the claims it can check against the repository: scripts, aliases, the folder tree, the route list, env vars, cited paths, links, ADR numbering and references, the client, layer and stylesheet tables, the censuses, the constants a guide quotes and the Gotchas invariants, plus the rules `CODING_STANDARDS.md` lists as enforced. It runs inside `pnpm test:ut`, so CI runs it on every pull request. A failure means a document and the code disagree: fix whichever one is wrong, and when a document leaves something out on purpose, say so in the allowlist at the top of that file rather than deleting the assertion. It cannot check rationale, and that part is on you. ADR 0015 records why it exists and what it costs: the markdown shape of these documents is parsed, so reformatting one can fail the build.

| If you change | Update |
| --- | --- |
| What a domain word means, or introduce a new one | [`GLOSSARY.md`](./GLOSSARY.md): the glossary, vocabulary only |
| A rule about how code is written | [`CODING_STANDARDS.md`](./CODING_STANDARDS.md) |
| A folder's layout, the files a concept is made of, or a coupling or gotcha its guide states | that folder's nested `AGENTS.md` (table above) |
| A behaviour a doc states as an invariant or a gotcha | that bullet, or delete it if it stopped being true |
| An env var | `env.schema` in `astro.config.ts`, `.env.example`, and the Gotchas bullet if it has one |
| A package script, a path alias, or the folder tree | the *Commands* / *Structure & aliases* sections here |
| The layer boundaries, the rendering mode, or the deploy target | the *Stack* / *Deploy* sections here, plus the ADR that decided it |
| A decision an ADR records | that ADR: amend it, or supersede it with a new one and say so in both `## Status` blocks |
| A claim `docs/docs-consistency.test.ts` asserts, on purpose | the doc first; the test only when the claim itself is what changed |
| What a reader who is not editing this tree would see: the layers, the content model, what renders where, how a deploy works | the page it belongs to in [`docs/wiki/`](./docs/wiki), which is the only documentation a non-contributor reads |

**[`docs/wiki/`](./docs/wiki) is published.** [`sync-wiki.yml`](./.github/workflows/sync-wiki.yml), byte for byte the workflow the sibling repositories run, rsyncs it into the repository's GitHub wiki on every push to `main` that touches it, `--delete` included, so editing a page in the GitHub UI is a change the next sync throws away. The docs test holds its link format: a **filename is the page name** (`Getting-Started.md` is reachable as `Getting-Started`), a link to another page is that **bare name and never a path**, and a link into this repository is an **absolute `https://github.com/` URL**.

A new ADR starts as a copy of [ADR 0000](./docs/adr/0000-adr-template.md), the template, which says when a decision earns one, where to link it from and how a Proposed one that will not be accepted is withdrawn.

## Gotchas

- **`light-dark()` in prod:** lightningcss downlevels it into a polyfill that breaks nested `color-scheme` inversion in production (dev looks fine). `Features.LightDark` stays in `lightningcss.exclude` in `astro.config.ts`; `errorRecovery: true` is also set. ADR 0006, and [`src/ui/styles/AGENTS.md`](./src/ui/styles/AGENTS.md).
- **`astro dev` hangs / SSR 500s / blank globe:** usually `.vite` cache thrash from running `astro check` or a second `astro dev` beside a live dev server (orphans deps chunks: `effect.js` → 500, `three`/`react-globe.gl` → blank). Fix: stop all dev processes, delete `node_modules/.vite`, restart.
- **`HIDE_CHROME`** (public boolean env) does more than its name says, so no component reads it: `siteChrome` in [`@modules/core/utils/siteChrome.ts`](./src/ui/modules/core/utils/siteChrome.ts) is the tree's only reader, and callers ask it `showsHeader`, `showsBreadcrumbs`, `showsTableOfContents` and `servesRealContent` instead. It hides the header, the breadcrumbs and an Article's Table of Contents, and it *replaces the page body* with an under-construction placeholder on every route outside the articles / tags / legal / error allowlist, so `/`, `/about`, `/contact` and `/projects` serve no real content at all; the footer still renders. It is **`true` in the `development` environment**, which is why the PR preview is not a faithful target. Outside that module the name appears only in the astro.config env schema and the deploy workflow. [ADR 0018](./docs/adr/0018-hide-chrome-replaces-the-page.md) records why the flag exists and what publishing a route means.
- **Safari/WebKit loads nothing in dev:** the CSP carries `upgrade-insecure-requests`, and WebKit obeys it on `localhost`: every module script, font and `@vite/client` request is rewritten to `https://localhost:4321`, which the dev server does not speak, so the page renders inert. Chromium exempts localhost, so this shows only in Safari and Playwright's `webkit` project. `securityHeaders(isDevelopment)` in [`securityHeaders.ts`](./src/const/securityHeaders.ts) drops that one directive from the set [`src/middleware.ts`](./src/middleware.ts) applies when `import.meta.env.DEV`; production keeps it.
- **Turso env naming:** the DB env vars are `ASTRO_DB_REMOTE_URL` / `ASTRO_DB_APP_TOKEN` although the project no longer uses Astro DB. Schema: [`src/infrastructure/db/schema.ts`](./src/infrastructure/db/schema.ts); migrations in `drizzle/`.
- **`import.meta.env` in `astro.config.ts` holds the built-ins and the `VITE_` variables, nothing else.** A read of `SITE_URL` there is `undefined`, the sitemap integration skips itself with a warning and the build still ends green. The config reads the environment through `loadEnv` from `vite` (the `.env` file and the process environment, which wins), and the docs test holds that `import.meta.env` is read nowhere in the config but as the key of a `define`.
- **`imageCdn.ts`, `noindexRoutes.ts` and `locale.ts` in `src/const` import nothing.** `astro.config.ts` loads the first two before `astro:env` exists, and the domain imports the third for the locale every `localeCompare` passes and reaches it again through `formatDate`; `const.ts` reads `astro:env/client`, so pulling `@const/index` into any of them breaks the config or drags env access into the domain.
- **`script-src` names each inline script by its sha256, and has no `'unsafe-inline'`.** The inline scripts are the two ADR 0005 and ADR 0013 need before paint, Astro's island runtime and its `load` directive: [`inlineScriptHashes`](./src/ui/modules/core/utils/inlineScripts.ts) hashes the text each one is rendered from, so changing any of them changes the policy in the same build. The two delivery paths compute the set with that one function and one analytics id: `astro.config.ts` hands the finished headers to the integration that writes `public/_headers`, and [`src/middleware.ts`](./src/middleware.ts) sets them on what the Worker renders. Every response carries the same set, because a `ClientRouter` swap runs the incoming page's inline scripts under the policy of the page the reader landed on: a policy per page would block an island on the second page of a visit. [`docs/built-output.test.ts`](./docs/built-output.test.ts) holds that every inline script of every prerendered page is named, that no page carries an inline event handler or a `javascript:` address, which the policy would block, and that the line carrying the policy stays under the 2,000 characters Cloudflare reads in a `_headers` rule, past which the rule is dropped. `/contact` is rendered on demand and carries the same kinds of script. A hydration directive other than `load` needs its prebuilt script added to the module, which the docs test holds. `style-src` allows inline styles, which Astro's islands, fonts and view transitions write. Development keeps `'unsafe-inline'` and names no digest, because the toolchain writes inline scripts of its own. A Tag Manager Custom HTML tag runs as an inline script and is blocked, so the container carries none. The policy has no `'unsafe-eval'` either, so every schema is built from `z` in [`@shared/utils/zod`](./src/shared/utils/zod.ts), which turns zod's JIT off before any exists: an object schema otherwise probes `new Function` as it is built, and the browser refuses the probe and reports a violation on every page that builds one.
- **Analytics are consent-gated, two different ways** (ADR 0013, ADR 0020). GA/GTM load on every page with `analytics_storage` denied until the visitor accepts the `analytics` category, set by an inline script in `<head>` before either initialises; nothing in the code makes that requirement visible, so do not reorder or "clean up" that script. Better Stack's browser tag has no consent mode, so `updatePreferences` appends it only once `acceptedService(BETTER_STACK_SERVICE, ANALYTICS_CATEGORY)` is true, on `onConsent` **and** `onChange`, since `onFirstConsent` never fires for a returning visitor. `BETTER_STACK_TRACKING_TOKEN` is public by construction, is not the credential the log export uses, and is a **repository** variable: one RUM source serves both stages, told apart by the `environment` the tag is `init`-ed with. **Cloudflare Web Analytics is the exception and nothing here can gate it**: the zone injects its beacon at the edge, so `securityHeaders.ts` must keep `https://static.cloudflareinsights.com` in `script-src` or the browser blocks it with no other symptom.
- **Image CDN switches by env:** Cloudflare image service in a production build, Contentful/passthrough otherwise (`CLOUDFLARE_ENV === "production"` in astro.config → adapter `imageService`).
- **The release config teaches both commit-parsing plugins the `!` grammar** through `parserOpts`, which `pnpm test:docs` holds equal: without it `feat(x)!: …` is analysed with no type, the job ends green and nothing is released, while commitlint accepts the `!`. The `preset` route does not work here: the notes step dies on *Missing helper*. `!` means major on any type, as a `BREAKING CHANGE:` footer does.
- **`minimumReleaseAge` in [`pnpm-workspace.yaml`](./pnpm-workspace.yaml) counts minutes, not days.** When a security fix is younger than that, Renovate adds it to `minimumReleaseAgeExclude` with a `# Renovate security update:` comment above it; that line is Renovate's, as `pnpm-lock.yaml` is pnpm's, and the YAML check in `pnpm test:docs` lets it through.
- **SSR externals:** `node:async_hooks` and `contentful` are externalized for SSR; the DB uses `@libsql/client/web` + `drizzle-orm/libsql/web`; the `nodejs_compat` flag is enabled in [`wrangler.toml`](./wrangler.toml).

## Deploy

Cloudflare Workers via wrangler ([`wrangler.toml`](./wrangler.toml)): `main` is the `@astrojs/cloudflare` server entrypoint, `dist/` is served as assets, and `env.production` carries the `SESSION` KV binding and the `biancafiore.me` custom domain. The workflows, the smoke run and the rollback are on the [CI/CD wiki page](./docs/wiki/CI-CD.md).

- **`[cache] enabled = true` holds because every route answers the same bytes to everybody**: the content pages prerender, `contact`, `404` and `500` read nothing off the request that is not in the URL, the middleware sets a header set decided at build time, and nothing reads the `SESSION` binding. A route that reads a cookie, a header or the session breaks that. `cross_version_cache` stays `false`, so every deploy starts cold, which is what makes an Article `publish-article.yml` redeploys appear at once.
- **Logs and traces leave through Cloudflare's own export, and `console` in [`@infrastructure/logging/logger.ts`](./src/infrastructure/logging/logger.ts) is what carries the app's lines into it** (ADR 0020). A destination belongs to the account, not to the Worker, which is why the stage is in its name (`biancafiore-web-production-logs`, `biancafiore-web-production-traces` and the `-development` pair): a development Worker naming production's is accepted and files preview traffic with the live site's. The top level is production's twin, so a bare `wrangler deploy` cannot reach the development source. The destinations must exist in the dashboard before a deploy, and nothing here can assert that they do. Rotating the log sink is a dashboard change: no redeploy, and no credential anywhere in this tree. Sampling is `1` on every stage and signal, written down rather than defaulted, and the siblings use the same number, so it changes in all three or in none.
- **The smoke cases** in [`e2e/smoke.spec.ts`](./e2e/smoke.spec.ts) carry `@smoke`, and the smoke step passes no `--pass-with-no-tests`, so a grep that stops matching fails the job. The four cases are the same, word for word, in every repository that deploys, and contribKit adds a fifth for an endpoint it cannot prerender. The fourth asks for `/.well-known/security.txt` and wants `text/plain`, an `Expires:` still ahead and the body byte for byte the file in `public/`, so a `security.txt` the Cloudflare zone serves itself, which answers before the Worker, fails the run instead of standing in for the repository's. What `robots.txt` says is the docs test's to assert. A failing smoke run rolls production back.
- **[`public/.well-known/security.txt`](./public/.well-known/security.txt) lapses unless it is renewed.** Its `Expires` is two years after its last renewal, the longest the docs test allows, and `pnpm test:docs` fails 30 days before that date, reading the real clock on purpose, so `main` turns red a month ahead and the fix is to move `Expires` forward, at most two years. The same rule holds its fields (`Contact`, `Expires`, `Preferred-Languages`, `Canonical`, `Policy`, in that order), its `Canonical` to `SITE_URL` plus `/.well-known/security.txt`, which a static file repeats because it reads no variable, and its `Policy` to this repository's. The Worker's assets answer it as `text/plain` before the Worker runs, so the middleware never sees it, and the `_headers` rule adds the security set, none of which changes its type.
- **`Check` is the one context the ruleset requires**, an aggregate over `Verify`, both deploys, `E2E (preview)`, `Production smoke tests` and `Semantic Release` that runs under `always()`: a job that must gate a merge goes in its `needs`.
- **The preview cleanup queues behind the pull request's own CI run**, in the group `CI-refs/pull/<number>/merge`, which is the group `ci.yml` computes for that run; the coupling is by `ci.yml`'s `name:`, `CI`.
- **`_deploy.yml` takes the GitHub Environment alone** and derives the wrangler environment from its last dash-separated segment, which also feeds `CLOUDFLARE_ENV` to the build, so a caller cannot pair an Environment with the wrong `[env.*]` block.
- **The Worker secrets ride the deploy** through `--secrets-file`, a JSON file written under `$RUNNER_TEMP` and removed in an `if: always()` step. The upload is additive: a secret the file omits is not deleted.
- **The build needs every server secret, though it only fetches Contentful.** The `astro:env/server` module Astro generates evaluates each `access: "secret"` field of the schema when it loads and throws on the first one missing, and the CMS client loads it while the content pages prerender. So `_deploy.yml` hands the Build step all seven secrets, and the collect step the same seven; no other step sees any. Handing the build only the Contentful pair fails it with *GOOGLE_RECAPTCHA_SECRET_KEY is missing*.
- **Neither the build nor the deploy is wrapped in `nick-fields/retry`**: both fail deterministically far more often than on a flake, and wrangler retries its own API calls. A font the build cannot fetch is fixed by clearing `node_modules/.astro/fonts`, not by a retry.
