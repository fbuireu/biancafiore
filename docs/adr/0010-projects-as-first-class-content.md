# 10. Projects are addressed by fragment, and whether they become pages is still open

Date: 2026-07-26

Amended: 2026-08-22, because the routing layer answered half the question while this stayed Proposed.

## Status

Proposed. The Project↔Article boundary is unresolved; the addressing is not.

## Context

A Project is a lightweight portfolio typology (`name`, rich `description`, `image`) surfaced as a card on the home "Disciplines" list and on the Projects page. Read as a finished model, that schema invites being treated as final. It is not, and the original form of this ADR said so: the intended direction was to give Projects the same shape as Articles, with `/projects/{slug}` detail pages.

A month on, that has not moved, and the code has quietly answered the smaller question in the opposite direction. `projectHref(id)` returns `` `${PAGES_ROUTES.PROJECTS}#${id}` ``: a **fragment on one page**, not a path to a page of its own. `createProjects` derives that id from `fields.id`, falling back to a slugified name, and the JSON-LD `ItemList` on both surfaces lists those fragments as the canonical address of a Project. That is a design somebody built deliberately, and it only makes sense if a Project does not get a page.

## Decision

**A Project is addressed by a fragment on `/projects`, and that is the current answer, not a placeholder.** `projectHref` is the one module that spells it, exactly as `articleHref` and `tagHref` spell theirs, and [`CONTEXT.md`](../../CONTEXT.md) says a Project has no Slug.

**Whether Projects should become sluggable content remains open, and the question that blocks it is a glossary question, not a routing one**: if a Project gains a slug, a body and a detail page, what distinguishes it from an Article: audience, source, whether self-initiated writing belongs in one or the other? Until `CONTEXT.md` answers that, there is nothing to build.

This ADR stays `Proposed` because that question is genuinely undecided. What it no longer does is instruct a maintainer to preserve a schema for a feature with no owner.

## Consequences

- The current Project schema is minimal because a card needs no more, and adding to it needs a reason of its own. It is no longer "expected to grow": treat it as the schema for what a Project is today.
- Fragments are what search engines are given, so a Project has no canonical URL of its own and cannot be shared, indexed or linked to independently of the Projects page. That is the cost of the current answer and the strongest argument for revisiting it.
- Landing the detail-page version means answering the boundary question in `CONTEXT.md` first, then the ordinary content-type path: domain concept → mapper → entity loader → route (see the application guide). `projectHref` is the seam that would change, and it is the only one.
- An open question with no owner rots. This one is listed in [`docs/BACKLOG.md`](../BACKLOG.md), which is where it gets picked up or dropped.
