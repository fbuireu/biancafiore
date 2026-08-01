# 16. Vitest resolves Astro's modules itself, on hand-written doubles

Date: 2026-07-31

## Status

Accepted.

## Context

Astro owns the module graph the unit tests run against. Two things in it are not files: the `astro:*` virtual modules, which only an Astro build synthesises, and the path aliases, which are declared in `tsconfig.json` and resolved by Astro's Vite pipeline rather than by TypeScript. A plain Vitest config sees neither, and almost every module worth testing reaches one of them.

The documented answer is `getViteConfig` from `astro/config`, which hands Vitest the project's real Vite configuration — aliases, plugins, virtual modules, all of it. It does not work here, and the reason is not preference. `getViteConfig` loads the whole config, adapter included; `@astrojs/cloudflare` installs `@cloudflare/vite-plugin`, and that plugin's `validateWorkerEnvironmentOptions` rejects the `resolve.external` list Astro sets on the `ssr` environment: *"The following environment options are incompatible with the Cloudflare Vite plugin"*. It is a startup error, raised while resolving the config, so not one test file is collected and there is nothing to skip past. The remaining alternatives were dropping the Cloudflare adapter — [ADR 0001](./0001-astro-ssr-on-cloudflare-workers.md) is why it is there — or having no unit tests at all.

## Decision

`vitest.config.ts` builds its own resolver and never loads Astro's.

Path aliases are **derived, not copied**: it parses `compilerOptions.paths` out of `tsconfig.json` and turns each entry into a Vite alias, so an alias is still declared in exactly one place and a new one works in tests the moment it is added.

`astro:env/server`, `astro:env/client` and `astro:middleware` are aliased to hand-written doubles in `src/tests/doubles/`. `astroMiddleware.ts` is the whole of the third one: `defineMiddleware` is an identity function that exists for its types, so returning the handler unchanged is not a simplification but what the real module does — which is what makes `onRequest` callable from `middleware.test.ts` and the dev-only CSP rewrite an assertion about behaviour rather than about the text of a condition. `astroEnvServer.ts` backs `getSecret` with a Map that `setSecret` and `resetSecrets` drive; `astroEnvClient.ts` exports fixed values for the public variables. A test seeds the double by importing it directly while the code under test imports `astro:env/server`, so the alias has to land on that exact file — if it ever resolved to a second copy there would be two Maps, and the seeding would silently stop reaching the code.

`astro:content` and `astro:actions` are deliberately **not** doubled. A test that needs `astro:content` declares its own `vi.mock("astro:content", …)`, which is what the article and tag DTO tests do for `reference`, and what the loader tests do for `defineCollection` as well. Nothing stands in for `astro:actions`, so importing a module that uses it fails outright: *"Cannot find package 'astro:actions'"*.

That is why `submitContact` lives in `src/actions/contact.ts` and imports nothing from `astro:*`, while `defineAction`, `ContactLayer` and `toActionError` stay in `src/actions/index.ts`. The split reads like layering and is not: it is the only reason the contact flow is reachable from a test at all. [`src/actions/CLAUDE.md`](../../src/actions/CLAUDE.md) states it as a rule.

## Consequences

- **The doubles are hand-written, so they can drift from the real modules.** Half of that is now checked: `docs/docs-consistency.test.ts` asserts `astroEnvClient.ts` exports exactly the variables the `env.schema` declares with `context: "client"`, in both directions, so adding one to the schema without the double fails the build. The server double is not checked and cannot be: it deliberately exports `setSecret`/`resetSecrets`, which the real module has never had, because a test needs to seed the secrets it reads. That surface stays maintained by hand, and a mismatch there first shows up as an undefined import in whichever test happens to touch it.
- **Two resolvers have to agree about aliases.** Astro resolves them from `tsconfig.json`; Vitest re-derives them by parsing the same file, taking only the first target of each entry and assuming a trailing `/*`. A `paths` entry shaped any other way resolves in the build and silently not in tests — the derivation removes the duplication, not the second implementation.
- **Anything importing `astro:actions` stays untestable** — the action binding, `ContactForm.tsx` — and Playwright does not close that gap either: the preview deployment runs with `HIDE_CHROME` on, which left the theme toggle as the only e2e that survives there.
- **A content loader is reachable, at the price of two mocks per file.** `astro:content` is stubbed down to `defineCollection` returning its argument, and `CmsClientLive` is replaced with the stub layer in `src/tests/doubles/cmsLayer.ts` — swapping the layer rather than `runCms` keeps the real `ManagedRuntime`, the real `Effect.all` batching and the real `isContentfulConfigured` in the test. `articles` and `authors` are covered that way; `cities`, `projects`, `tags` and `testimonials` still are not.
- **A loader test cannot see the collection schema.** `reference()` has no stand-in — the real one resolves against collections that only a build knows about — so the loader tests stub it with a `z.custom` that throws if anything ever parses through it, and validate no entry against `schema`. A loader whose entries the schema rejects still fails first at build time, and that half of `defineCollection` is untested by construction.
- **The split in `src/actions` is load-bearing.** Importing `ActionError` into `contact.ts` to tidy the error handling, or folding `submitContact` back beside `defineAction`, takes `contact.test.ts` down with it.
- **The tests do not run the project's build.** No Astro plugins, no `.astro` compilation, no `define` from `astro.config.ts`. A unit test can pass against code the build then treats differently, which is a gap only the e2e suite closes.
