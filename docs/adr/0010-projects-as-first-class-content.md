# 10. Projects will become first-class sluggable content, mirroring Articles

Date: 2026-07-26

## Status

Proposed. Not implemented; the Project↔Article boundary has to be resolved before it lands.

## Context

Today a Project is a lightweight portfolio typology (`name`, rich `description`, `image`) surfaced only as a card on the home "Disciplines" list and the Projects page, with no detail page of its own. Read as a finished model, that schema invites being treated as final; it is not.

## Decision

The intended direction is to give Projects the same shape as Articles: individual `/projects/{slug}` detail pages with rich content, so a Project becomes a full content entity rather than a catalog card.

It is recorded as proposed rather than accepted because the question it opens is not answered yet: if a Project gains a slug, a body and a detail page, what still distinguishes it from an Article: audience, source, whether self-initiated writing belongs in one or the other?

## Consequences

- The minimal current Project schema is deliberate and expected to grow. Do not treat it as final, and do not "simplify" it on the assumption that it is finished.
- Landing this means answering the boundary question in [`CONTEXT.md`](../../CONTEXT.md) first, since Project and Article are glossary terms before they are schemas.
- Adding a slug and a detail page is the ordinary content-type path: domain concept → DTO → entity loader → route (see the application guide).
