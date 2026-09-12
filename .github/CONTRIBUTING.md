# Contributing to biancafiore

Thanks for considering it. This is the portfolio and blog of a content writer, an Astro SSR site on
Cloudflare Workers with content served from Contentful, and that split decides what a contribution can be:
**code lives here, content does not**. Read this before your first pull request; it will save you a rejected
commit.

If you want the shape of the codebase, that is [CLAUDE.md](../CLAUDE.md) and the nested guides it links. If
you want the vocabulary, that is [CONTEXT.md](../CONTEXT.md). If you want the *why*, that is
[docs/adr/](../docs/adr/).

## Code of Conduct

By participating you are expected to uphold the [Code of Conduct](./CODE_OF_CONDUCT.md). In short:

- **Be respectful**: different viewpoints and experiences are valuable
- **Be constructive**: focus on what is best for the project
- **Be collaborative**: work together towards common goals
- **Be patient**: we all have different levels of experience

## How can I contribute?

### Reporting bugs

Check the existing issues first, then use the [bug report template](ISSUE_TEMPLATE/bug_report.yml). Include
what you did, what you expected, and what actually happened, with the browser and OS.

**A typo in an article is not a bug in this repository.** Articles, projects and testimonials live in
Contentful, so a pull request cannot fix them; use the
[content issue template](ISSUE_TEMPLATE/content_issue.yml) instead and it will be corrected in the CMS.

Security issues go through the [Security Policy](./SECURITY.md), never a public issue.

### Suggesting features

Use the [feature request template](ISSUE_TEMPLATE/feature_request.yml). Describe the problem before the
solution, and check [Discussions](https://github.com/fbuireu/biancafiore/discussions) first; some ideas are
already being talked about.

### Improving documentation

Use the [documentation template](ISSUE_TEMPLATE/documentation.yml), or just open a pull request. The
user-facing documentation is the [wiki](../docs/wiki/), edited **in this repository** and published by
[`sync-wiki.yml`](./workflows/sync-wiki.yml) on every push touching it, so an edit made in the wiki UI is
overwritten on the next sync. The agent-facing guides (`CLAUDE.md` and friends) are held to the code by a
test, so read *The docs are part of the change* below before editing one.

## Getting started

Both runtimes are pinned exactly and must match: Node in [`.nvmrc`](../.nvmrc), mirrored in `engines.node`,
and pnpm in `packageManager`. Read the pin from the file; it is not written down anywhere else on purpose.

```bash
git clone https://github.com/YOUR_USERNAME/biancafiore.git
cd biancafiore

# Always pnpm, never npm or yarn. This also installs the git hooks
pnpm install

# Copy the env file and fill in values; local secrets go in .dev.vars
cp .env.example .env

# Start the dev server (no browser)
pnpm dev
```

`pnpm wrangler:dev` runs the site in the real Workers runtime when a change touches anything server-side.
If `astro dev` hangs or SSR starts returning 500s, stop every dev process, delete `node_modules/.vite`, and
restart; the Gotchas section of [CLAUDE.md](../CLAUDE.md) explains why.

## Checks

Everything CI runs, you can run locally:

```bash
pnpm lint:all           # biome lint (append :fix to autofix)
pnpm format:all         # biome check --write
pnpm typecheck          # astro sync && tsc --noEmit
pnpm check              # astro check: the only thing that typechecks .astro files
pnpm test:ut            # unit tests (vitest), the docs contract included
pnpm test:docs          # the docs contract alone
pnpm test:e2e           # end-to-end tests (playwright)
pnpm verify             # format check, typecheck, astro check and coverage: what CI runs
```

Husky runs lint-staged on `pre-commit`, commitlint on `commit-msg` and `pnpm verify:changed` on `pre-push`.
The hook runs the changed-only variant rather than `verify` because the coverage floor and a subset run
cannot both hold; CI runs the full `pnpm verify` on the pushed sha, so a push whose coverage dropped still
fails its check. [CLAUDE.md](../CLAUDE.md) explains the trade.

## Conventions that will bite you if you skip them

- **Use the glossary's words.** [CONTEXT.md](../CONTEXT.md) names one canonical term per concept. A
  variable named after a retired term is a defect, not a style preference.
- **No code comments.** Rationale belongs in commit messages, pull requests, an ADR or the folder's guide,
  not inline.
- **One argument is positional and two or more are a single object typed `<FunctionName>Params`**:
  `isWithin({ pathname, route }: IsWithinParams)`. The exception is a function a runtime calls back, such
  as a `sort` comparator, which is handed its arguments one at a time.
- **No Biome suppressions.** Fix the root cause instead of `biome-ignore`. `noConsole` is an error
  everywhere but the log transport: log through `LoggerService` or the `logger` import.
- **Design tokens over magic numbers**, and respect the CSS `@layer` order; cascade correctness depends on
  it. Details in the styles guide under [`src/ui/styles/`](../src/ui/styles).
- **Cross-layer imports use the path aliases; same-folder imports stay relative.**

## Commit rules

Conventional Commits, enforced by commitlint on `commit-msg`. semantic-release owns versioning, so the type
you choose is the version bump you get.

| Type | Bump | Example |
| --- | --- | --- |
| `feat` | minor | `feat: add a reading-time estimate to articles` |
| `fix` | patch | `fix: keep the table of contents in view on scroll` |
| `perf` | patch | `perf: prerender the tag pages` |
| `revert` | patch | `revert: feat: add a reading-time estimate to articles` |
| `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build` | none | `docs: correct the article glossary entry` |

Breaking changes take a `!` after the type or a `BREAKING CHANGE:` footer, and bump the major.

A scope is optional and unconstrained: [`commitlint.config.ts`](../commitlint.config.ts) extends
`@commitlint/config-conventional` and declares no `scope-enum`.

**`main` takes squash merges, so the pull request title is the commit that lands.** The `commit-msg` hook
lints what you type locally, and [`commit-message.yml`](./workflows/commit-message.yml) lints the pull
request title on every open and edit, because that title is what semantic-release parses. Title the pull
request the way you would title a commit.

Do **not** add a `Co-Authored-By` trailer for an AI assistant to a commit or a pull request.

## The docs are part of the change

This repo treats its documentation as part of the code: change one, update the other **in the same
commit**. A follow-up commit is a promise, not a fix.
[`docs/docs-consistency.test.ts`](../docs/docs-consistency.test.ts) runs with the unit tests and fails the
build when the docs and the repo disagree. It also parses the markdown shape of the guides, so even
reformatting one can fail. When it fails, fix whichever side is wrong, and never delete an assertion to get
green. [CLAUDE.md](../CLAUDE.md) has the full table of what to update for a given change.

## Pull requests

1. Fork, branch from `main`, make the change.
2. Run the checks above; fill in the pull request template, GIF included.
3. CI deploys a per-PR preview Worker and comments its URL on the pull request. Previews run with
   `HIDE_CHROME`, so parts of the site are deliberately hidden there. The E2E suite runs against the
   preview and gates the merge.
4. After merge to `main`, semantic-release versions and deploys automatically; there is no manual release
   step. A release is cut only after the production deploy and its smoke run pass.

## Use of AI

If you use AI tools when contributing:

- **Review everything it produces.** You are responsible for what you submit.
- **Check its claims against the code.** A doc claim nobody verified is a doc claim that is wrong.
- **Disclose significant use** in the pull request description.
- **Do not add a Claude or Copilot co-author trailer** to commits or pull requests.

## Questions

- **Issues**: <https://github.com/fbuireu/biancafiore/issues>
- **Discussions**: <https://github.com/fbuireu/biancafiore/discussions>
- **Wiki**: <https://github.com/fbuireu/biancafiore/wiki>
- **Security**: [SECURITY.md](./SECURITY.md)

Thanks for contributing! 🎉
