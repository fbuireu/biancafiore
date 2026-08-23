# 15. The agent guides are enforced by a test

Date: 2026-07-26

## Status

Accepted.

## Context

This repo carries an unusual amount of prose: a root [`CLAUDE.md`](../../CLAUDE.md), five nested guides, a glossary in [`CONTEXT.md`](../../CONTEXT.md), and this ADR directory. They are the primary interface to the codebase for anyone — increasingly, for an agent — arriving without context, and the maintenance contract already states the rule: when you change code, update the docs in the same commit.

Nothing checked. Documentation rot is silent by construction: no build fails, no type breaks, and the only signal is a reader acting on a claim that stopped being true. The first run of a checker over these documents found three of them:

- `@styles/*` was documented as mapping to `src/styles`; [`tsconfig.json`](../../tsconfig.json) maps it to `src/ui/styles`.
- The route list omitted `articles/index`, `privacy-policy` and `terms-and-conditions`.
- The folder tree listed `src/utils` and `src/db`, which do not exist in the repository at all.

None of these were noticed by review, because a document that reads plausibly is indistinguishable from a document that is correct.

## Decision

[`docs/docs-consistency.test.ts`](../docs-consistency.test.ts) reads the guides as data and asserts every mechanically checkable claim against the repository: package scripts, path aliases and the folders they map to, the folder tree, the route list, `.env.example` against the `env.schema` in [`astro.config.ts`](../../astro.config.ts), every path and relative link cited in any document, ADR numbering, template and references, the infrastructure client table, the stylesheet layer table, the domain concepts against the glossary, and the invariants stated in Gotchas. It runs with `pnpm test:ut`, so it runs in CI on every pull request.

A later pass extended it past references into the behavioural rules the nested guides state, which is where the second audit found its errors: that secrets are read lazily inside a layer and `astro:env/server` is never a module import, that irrecoverable misconfiguration is `Effect.die`, that every tagged error is declared in [`errors.ts`](../../src/infrastructure/errors.ts) and no tag becomes an HTTP status outside `contactErrorResponse`, that the domain imports nothing the guide does not name, that DTOs may build an image URL but never fetch one, that every loader bails without credentials and batches unbounded, and that the reveal modifiers stay below the class they beat only by source order. Constants a guide quotes — the reCAPTCHA threshold, the type-scale ratio, the container axes — are derived from the source and matched against the sentence, so the assertion fails both when the constant changes and when the sentence is deleted. Each of these was verified by mutation: break the code, watch that specific assertion go red, revert.

Deliberate omissions are named allowlists at the top of that file — `SCRIPTS_INTENTIONALLY_UNDOCUMENTED`, `CONCEPTS_OUTSIDE_THE_GLOSSARY`, `DOCUMENTED_PATH_EXAMPLES`. When the honest answer is "the guide leaves this out on purpose", that answer is recorded rather than achieved by deleting the assertion.

The alternative — generating the guides from the code — was rejected. What makes these documents worth reading is the part no generator can produce: why a decision was made, which trap it avoids, what not to do. Generating them would preserve the checkable half and destroy the valuable one.

## Consequences

- **The markdown shape of the guides is now load-bearing.** The test parses fenced blocks, table rows, the alias line, the route comment. Reformatting a guide can fail CI even when every word in it is true, and restructuring one means updating the parser in the same commit. This is the real cost of the decision, and it is accepted knowingly: a format that is parsed is a format that cannot drift quietly.
- It verifies claims, not reasoning. Rationale — why a decision was made, whether an explanation is still honest, whether an ordering is *intended* rather than merely current — stays outside its reach, and a guide can be entirely green and thoroughly misleading. The behavioural assertions narrow that gap without closing it: they pin what the code does, never why it should.
- **An assertion that has not been mutation-tested is decoration.** A check that reads the wrong file, stops at the first match, or greps a string that happens to appear elsewhere passes green forever and is worse than no check, because it advertises coverage it does not have. The rule when adding one: break the thing it guards, watch that assertion fail, revert.
- **Mutate the pairing, not just the token.** An adversarial pass found the tag-to-status assertion accepting a full inversion of the mapping (`toActionError` then, `contactErrorResponse` now) — `ValidationError` answering `UNAUTHORIZED` and a duplicate answering `BAD_REQUEST` — with all tests green, because it searched for each half of `X → Y` independently. The original mutation had only *renamed* a status, which the loose check did catch. A mutation that removes a token proves less than one that permutes two, and a test named "maps exactly" must compare the pairs.
- **Co-citation is not verification.** Where an assertion checks that a guide quotes the same number the source declares, it proves the two agree and nothing about the number being right or used correctly. Several assertions here are of that kind and are honest inventory checks, not behaviour checks.
- A documented directory must contain at least one file to count as existing, because git does not track empty directories. Without that rule a stale empty folder in one working copy passes locally and fails in CI, which is how `src/utils` and `src/db` survived.
- ADRs are covered by it: the template in this file's own shape (`# N. Title`, Date, Status) is asserted, and every ADR must be referenced from a guide or another ADR. An ADR nothing links to will not be read, so an unlinked one now fails rather than quietly rotting.
- A false positive blocks a pull request. The intended fix is the allowlist or the parser — deleting an assertion to get green is how this file stops being true.
