# 19. Three questions before a concept earns a type

Date: 2026-08-29

## Status

Accepted.

## Context

[ADR 0012](./0012-pragmatic-ddd-domain-layer-anti-corruption-layer.md) settled *where* modelling lives: a domain layer of schemas and pure rules behind a Contentful anti-corruption layer. It did not settle *how much* of it to do, and that omission has a cost in both directions.

Modelling too little is the familiar one: a raw union cast to its resolved half, a business rule copied into three helpers, an editorial pairing that only holds because nobody has broken it yet. Modelling too much is quieter and, in a tree this size, more expensive. A branded type threaded through six Zod schemas, Astro's `CollectionEntry` typing and `reference()` is not free; a wrapper whose only consumer is the test that constructs it is worse than the primitive it replaced, because it reads as a guarantee and is not one.

The audit that produced this ADR found both shapes within a hundred lines of each other, and the deciding factor was never "is this a domain concept". It was always one of three much narrower questions, asked in a fixed order. Writing them down is the point: a criterion that is re-derived per finding is not a criterion, and the rejections are the half that gets lost.

## Decision

Before giving a concept a type, a wrapper or a schema of its own, ask these three **in order**, and stop at the first answer that decides it.

1. **Can the illegal state be reached?** A shape the type permits but no code path produces is a guard, not a bug. Protect it with the cheapest thing that turns it into a compile error or a loud failure, say in the commit that it is a guard, and stop. Do not build a type around a state nothing can construct.
2. **Does anyone read it?** A field, a discriminant or a wrapper whose only consumer is the test that constructs it is not modelling anything. Either give it a reader or take it out.
3. **Does it cross a boundary?** A concept that leaves the domain, reaches a public payload, gets persisted or is written down in two languages earns a real type. One that lives inside a single function does not.

Three "no" answers mean **write the rule down instead of coding it**: an assertion, a line in the folder's guide, an entry here. A divergence that is named is finished work; a divergence that is only remembered is not.

### Worked examples, all from this tree

**Refused an unresolved author link — yes, yes, yes.** Contentful answers `fields.author` as a union of a resolved `Entry` and an `UnresolvedLink`, and returns the link half whenever the target is unpublished. `createAuthor` in [`dto/author/utils/author.ts`](../../src/application/dto/author/utils/author.ts) cast the union to the resolved half and read `fields.name` off it. Reachable from ordinary CMS state, read on every Byline, and it crosses into the rendered page. The type already said so; four other readers of that same union narrow on `"fields" in entry` and this one did not. Guard, not a new type.

**One publish-date rule instead of three — no, no, no.** `publishDateISO` in [`domain/article/rules.ts`](../../src/domain/article/rules.ts) throws on a date it cannot read. `dto/article/utils/order.ts` carried a copy returning `""`, and `dto/author/utils/articles.ts` a third reading `Date.parse(...) || 0`, so the same entry was refused by the articles collection, sorted last by the tag index and dated to the epoch by the About page. The tolerant halves failed all three questions: unreachable in a shipped build, because the articles loader refuses the entry first and takes the build down with it; read by nothing but their own tests; crossing no boundary. So they went, rather than being promoted into a second named rule, and the reason is in [the domain guide](../../src/domain/CLAUDE.md).

**`updatedAt` routed through that same rule — no, yes, yes.** It took `sys.updatedAt` unvalidated and emitted it as JSON-LD `dateModified` and Open Graph `modifiedTime`. Question 1 says no: Contentful always sets `sys.updatedAt`, so the bad state is not reachable today. But it is read, and it crosses into a public payload, so the cheapest guard that makes the ISO-ness true by construction rather than by trust is to call the rule that already exists. No `IsoDate` brand: the value is minted at one boundary and the rule is at that boundary.

**A `Slug` value object — rejected on question 3, despite it looking like a yes.** A Slug is persisted, addresses a page and appears in JSON-LD, which reads like the clearest "crosses a boundary" in the tree. It is still not worth a branded type: it is minted in exactly two modules (`articleSlug`, and `slugify` for a City), and [`@const/routes.ts`](../../src/const/routes.ts) is already the only module allowed to turn one into a path. Branding it would touch every schema, `CollectionEntry` and Astro's `reference()` for a guarantee the minting boundary already gives. Named here so it is not re-proposed.

**Identity by name in three loaders — one aligned, two rejected.** [`CONTEXT.md`](../../CONTEXT.md) states that one Author is one Slug and that the name is a display label, and the `authors` loader keyed the collection on the name anyway, which collapses two Authors who share one. That is the glossary and the code disagreeing about identity, so the loader moved to the slug. `cities` keeps the name, because a City's slug is `slugify(name)` and the two are the same identity by construction. `testimonials` keeps the author's name, because a Testimonial has no identifier but the person quoted, and `CONTEXT.md` never promises that is unique: two quotes from one person would collapse, and that is a known cost, written here rather than fixed with an id the CMS does not have.

**The `type` on a Tag Index entry — question 2 said no, so it got a reader.** `TagType` discriminates a topical Tag from an Author Tag, is set by `getTags`/`getAuthors` and is persisted in the collection. Downstream, nothing read it: `/tags/[slug]` labelled every entry `#slug` and told the reader "Articles tagged with", including on an Author's page. A discriminant with no reader is how a sealed union rots, and here it had a visible cost. It reads it now.

## Consequences

- **The order is load-bearing.** Question 1 before question 2 is what stops an unreachable state from acquiring a type; question 2 before question 3 is what stops "it is persisted" from justifying a field nothing consumes. Asking them in any other order gives different answers.
- **Rejections have to be written down or the criterion is untestable.** The `Slug` brand, the two loaders that keep identity by name, and the tolerant date branches are recorded above precisely because a decision that only exists as an absence gets re-proposed.
- **This makes some things slower.** Refusing bad CMS data at the mapper means one malformed entry fails the build rather than degrading one page, which is the existing convention here (`articleSlug` and `createPeriod` already throw) and is now applied consistently across the three loaders instead of one.
- **It does not license refactoring on sight.** A cast, a duplicated helper or a bare primitive that answers "no" three times is finished work once the rule naming it exists.
- Where it bites: [the domain guide](../../src/domain/CLAUDE.md) for the single date rule, [the application guide](../../src/application/CLAUDE.md) for the unresolved link and for identity per loader, and [`CONTEXT.md`](../../CONTEXT.md) for the Author identity the glossary always stated.
