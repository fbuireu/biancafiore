# Contributing to biancafiore

Thanks for considering it. This is the portfolio and blog of a content writer —
an Astro SSR site on Cloudflare Workers with content served from Contentful —
and that split decides what a contribution can be. Read this before your first
pull request.

If you want the shape of the codebase, that is [CLAUDE.md](./CLAUDE.md) and the
nested guides it links. If you want the vocabulary, that is
[CONTEXT.md](./CONTEXT.md). If you want the *why*, that is
[docs/adr/](./docs/adr/).

## Code of Conduct

By participating you are expected to uphold the
[Code of Conduct](./CODE_OF_CONDUCT.md). In short:

- **Be respectful**: different viewpoints and experiences are valuable
- **Be constructive**: focus on what is best for the project
- **Be collaborative**: work together towards common goals
- **Be patient**: we all have different levels of experience

## What can be contributed here — and what cannot

**Code, yes.** Bug fixes, accessibility, performance, and build improvements
are welcome through the normal fork-and-PR flow.

**Content, no.** Articles, projects and testimonials live in Contentful, not in
this repository. A typo in an article cannot be fixed by a PR — use the
[content issue template](.github/ISSUE_TEMPLATE/content_issue.yml) instead and
it will be corrected in the CMS.

Security issues go through the [Security Policy](./SECURITY.md), not a public
issue.

## Getting started

```bash
# Requires the Node version in engines and pnpm (see packageManager in package.json)
# Always pnpm, never npm or yarn
pnpm install

# Copy the env file and fill in values; local secrets go in .dev.vars
cp .env.example .env

# Start the dev server (no browser)
pnpm start
```

`pnpm wrangler:dev` runs the site in the real Workers runtime when a change
touches anything server-side. If `astro dev` hangs or SSR starts returning
500s, stop every dev process, delete `node_modules/.vite`, and restart — the
Gotchas section of [CLAUDE.md](./CLAUDE.md) explains why.

## Checks

```bash
pnpm check              # astro check (template + type check)
pnpm typecheck          # astro sync && tsc --noEmit
pnpm lint:all           # biome lint (append :fix to autofix)
pnpm format:all         # biome check --write
pnpm test:ut            # unit tests (vitest)
pnpm test:e2e           # end-to-end tests (playwright)
```

## Conventions that will bite you if you skip them

- **No code comments.** Rationale belongs in commit messages, PRs, or the
  folder's guide — not inline.
- **No Biome suppressions.** Fix the root cause instead of `biome-ignore`.
  `noConsole` is an error with no allowlist: log through Effect's `Logger`.
- **Design tokens over magic numbers**, and respect the CSS `@layer` order —
  details in the styles guide under `src/ui/styles/`.
- **Conventional commits are mandatory** — semantic-release derives versions
  and the changelog from them, and commitlint rejects anything else.

## The docs are part of the change

This repo treats its documentation as part of the code: change one, update the
other **in the same commit**. `docs/docs-consistency.test.ts` runs with the
unit tests and fails the build when the docs and the repo disagree — and it
parses the markdown shape of the guides, so even reformatting one can fail.
[CLAUDE.md](./CLAUDE.md) has the full table of what to update for a given
change.

## Pull requests

1. Fork, branch from `main`, make the change.
2. Run the checks above; fill in the PR template.
3. CI deploys a per-PR preview Worker — note that previews run with
   `HIDE_CHROME`, so parts of the site are deliberately hidden there.
4. After merge to `main`, semantic-release versions and deploys automatically.

Thanks for contributing! 🎉
