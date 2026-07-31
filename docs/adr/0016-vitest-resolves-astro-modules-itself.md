# 16. Vitest resolves Astro's modules itself, on hand-written doubles

Date: 2026-07-31

## Status

Accepted.

## Context

Astro owns the module graph the unit tests run against. Two things in it are not files: the `astro:*` virtual modules, which only an Astro build synthesises, and the path aliases, which are declared in `tsconfig.json` and resolved by Astro's Vite pipeline rather than by TypeScript. A plain Vitest config sees neither, and almost every module worth testing reaches one of them.

The documented answer is `getViteConfig` from `astro/config`, which hands Vitest the project's real Vite configuration — aliases, plugins, virtual modules, all of it. It does not work here, and the reason is not preference. `getViteConfig` loads the whole config, adapter included; `@astrojs/cloudflare` installs `@cloudflare/vite-plugin`, and that plugin's `validateWorkerEnvironmentOptions` rejects the `resolve.external` list Astro sets on the `ssr` environment: *"The following environment options are incompatible with the Cloudflare Vite plugin"*. It is a startup error, raised while resolving the config, so not one test file is collected and there is nothing to skip past. The remaining alternatives were dropping the Cloudflare adapter — ADR 0001 is why it is there — or having no unit tests at all.

## Decision

`vitest.config.ts` builds its own resolver and never loads Astro's.

Path aliases are **derived, not copied**: it parses `compilerOptions.paths` out of `tsconfig.json` and turns each entry into a Vite alias, so an alias is still declared in exactly one place and a new one works in tests the moment it is added.

`astro:env/server` and `astro:env/client` are aliased to hand-written doubles in `tests/doubles/`. `astroEnvServer.ts` backs `getSecret` with a Map that `setSecret` and `resetSecrets` drive; `astroEnvClient.ts` exports fixed values for the public variables. A test seeds the double by importing it directly while the code under test imports `astro:env/server`, so the alias has to land on that exact file — if it ever resolved to a second copy there would be two Maps, and the seeding would silently stop reaching the code.

`astro:content` and `astro:actions` are deliberately **not** doubled. A test that needs `astro:content` declares its own `vi.mock("astro:content", …)`, which is what the article and tag DTO tests do for `reference`. Nothing stands in for `astro:actions`, so importing a module that uses it fails outright: *"Cannot find package 'astro:actions'"*.

That is why `submitContact` lives in `src/actions/contact.ts` and imports nothing from `astro:*`, while `defineAction`, `ContactLayer` and `toActionError` stay in `src/actions/index.ts`. The split reads like layering and is not: it is the only reason the contact flow is reachable from a test at all. [`src/actions/CLAUDE.md`](../../src/actions/CLAUDE.md) states it as a rule.

## Consequences

- **The doubles are hand-written, so they can drift from the real modules.** Half of that is now checked: `tests/docs-consistency.test.ts` asserts `astroEnvClient.ts` exports exactly the variables the `env.schema` declares with `context: "client"`, in both directions, so adding one to the schema without the double fails the build. The server double is not checked and cannot be: it deliberately exports `setSecret`/`resetSecrets`, which the real module has never had, because a test needs to seed the secrets it reads. That surface stays maintained by hand, and a mismatch there first shows up as an undefined import in whichever test happens to touch it.
- **Two resolvers have to agree about aliases.** Astro resolves them from `tsconfig.json`; Vitest re-derives them by parsing the same file, taking only the first target of each entry and assuming a trailing `/*`. A `paths` entry shaped any other way resolves in the build and silently not in tests — the derivation removes the duplication, not the second implementation.
- **Whole categories of module stay untestable.** Anything importing `astro:actions` — the action binding, `ContactForm.tsx` — cannot be loaded by Vitest, and `astro:content` costs a per-file `vi.mock`, so the loaders in `src/application/entities` are only covered end to end. Coverage over those folders means less than the number suggests; Playwright is what actually exercises them.
- **The split in `src/actions` is load-bearing.** Importing `ActionError` into `contact.ts` to tidy the error handling, or folding `submitContact` back beside `defineAction`, takes `contact.test.ts` down with it.
- **The tests do not run the project's build.** No Astro plugins, no `.astro` compilation, no `define` from `astro.config.ts`. A unit test can pass against code the build then treats differently, which is a gap only the e2e suite closes.
