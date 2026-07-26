# 15. The agent guides are enforced by a test

Date: 2026-07-26

## Status

Accepted.

## Context

This repo carries an unusual amount of prose: a root `CLAUDE.md`, five nested guides, a glossary in `CONTEXT.md`, and this ADR directory. They are the primary interface to the codebase for anyone — increasingly, for an agent — arriving without context, and the maintenance contract already states the rule: when you change code, update the docs in the same commit.

Nothing checked. Documentation rot is silent by construction: no build fails, no type breaks, and the only signal is a reader acting on a claim that stopped being true. The first run of a checker over these documents found three of them:

- `@styles/*` was documented as mapping to `src/styles`; `tsconfig.json` maps it to `src/ui/styles`.
- The route list omitted `articles/index`, `privacy-policy` and `terms-and-conditions`.
- The folder tree listed `src/utils` and `src/db`, which do not exist in the repository at all.

None of these were noticed by review, because a document that reads plausibly is indistinguishable from a document that is correct.

## Decision

`tests/docs-consistency.test.ts` reads the guides as data and asserts every mechanically checkable claim against the repository: package scripts, path aliases and the folders they map to, the folder tree, the route list, `.env.example` against the `env.schema` in `astro.config.ts`, every path and relative link cited in any document, ADR numbering, template and references, the infrastructure client table, the stylesheet layer table, the domain concepts against the glossary, and the invariants stated in Gotchas. It runs with `pnpm test:ut`, so it runs in CI on every pull request.

Deliberate omissions are named allowlists at the top of that file — `SCRIPTS_INTENTIONALLY_UNDOCUMENTED`, `CONCEPTS_OUTSIDE_THE_GLOSSARY`, `DOCUMENTED_PATH_EXAMPLES`. When the honest answer is "the guide leaves this out on purpose", that answer is recorded rather than achieved by deleting the assertion.

The alternative — generating the guides from the code — was rejected. What makes these documents worth reading is the part no generator can produce: why a decision was made, which trap it avoids, what not to do. Generating them would preserve the checkable half and destroy the valuable one.

## Consequences

- **The markdown shape of the guides is now load-bearing.** The test parses fenced blocks, table rows, the alias line, the route comment. Reformatting a guide can fail CI even when every word in it is true, and restructuring one means updating the parser in the same commit. This is the real cost of the decision, and it is accepted knowingly: a format that is parsed is a format that cannot drift quietly.
- It verifies references, not reasoning. Prose, rationale and "is this explanation still honest" are outside its reach — a guide can be entirely green and thoroughly misleading. The test lowers the cost of trusting the mechanical claims; it does not lower the cost of writing the rest.
- A documented directory must contain at least one file to count as existing, because git does not track empty directories. Without that rule a stale empty folder in one working copy passes locally and fails in CI, which is how `src/utils` and `src/db` survived.
- ADRs are covered by it: the template in this file's own shape (`# N. Title`, Date, Status) is asserted, and every ADR must be referenced from a guide or another ADR. An ADR nothing links to will not be read, so an unlinked one now fails rather than quietly rotting.
- A false positive blocks a pull request. The intended fix is the allowlist or the parser — deleting an assertion to get green is how this file stops being true.
