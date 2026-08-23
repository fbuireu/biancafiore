# Contributing to biancafiore

Thanks for considering it. This is the portfolio and blog of a content writer:
an Astro SSR site on Cloudflare Workers with content served from Contentful,
and that split decides what a contribution can be. Read this before your first
pull request.

If you want the shape of the codebase, that is [CLAUDE.md](./CLAUDE.md) and the
nested guides it links. If you want the vocabulary, that is
[CONTEXT.md](./CONTEXT.md). If you want the *why*, that is
[docs/adr/](./docs/adr/).

## Code of Conduct

By participating you are expected to uphold the
[Code of Conduct](./CODE_OF_CONDUCT.md), which is short and worth reading
rather than summarising here.

## What can be contributed here, and what cannot be

**Code, yes.** Bug fixes, accessibility, performance, and build improvements
are welcome through the normal fork-and-PR flow.

**Content, no.** Articles, projects and testimonials live in Contentful, not in
this repository. A typo in an article cannot be fixed by a PR: use the
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
500s, stop every dev process, delete `node_modules/.vite`, and restart. The
Gotchas section of [CLAUDE.md](./CLAUDE.md) explains why.

## Checks

`pnpm verify` is the gate: it runs the formatter check, the type check and the
unit suite with coverage, and it is what `pre-push` runs. The full list of
scripts is the *Commands* section of [CLAUDE.md](./CLAUDE.md); it is not
repeated here, because a second copy is a copy that goes stale.

## Conventions that will bite you if you skip them

The *Conventions* section of [CLAUDE.md](./CLAUDE.md) is the list, and it is
the one the docs test checks. The five that catch people out: **no code
comments**, **no Biome suppressions**, **design tokens over magic numbers**,
**one argument is positional and two or more are a single object typed
`<FunctionName>Params`**, and **conventional commits**, which semantic-release
derives versions from and commitlint rejects anything else.

## The docs are part of the change

This repo treats its documentation as part of the code: change one, update the
other **in the same commit**. `docs/docs-consistency.test.ts` runs with the
unit tests and fails the build when the docs and the repo disagree.
[ADR 0015](./docs/adr/0015-docs-consistency-enforced-by-a-test.md) explains why
that test exists and what it costs; [CLAUDE.md](./CLAUDE.md) has the table of
what to update for a given change.

## Pull requests

1. Fork, branch from `main`, make the change.
2. Run the checks above; fill in the PR template.
3. CI deploys a per-PR preview Worker. Where the `HIDE_CHROME` environment
   variable is set, most of the site serves an under-construction placeholder
   there rather than its real content
   ([ADR 0018](./docs/adr/0018-hide-chrome-replaces-the-page.md)), so a preview
   is not a faithful target for every route.
4. After merge to `main`, semantic-release versions and deploys automatically.

Thanks for contributing! 🎉
