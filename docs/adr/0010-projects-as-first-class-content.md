---
Status: proposed
---

# Projects will become first-class sluggable content, mirroring Articles

Today a Project is a lightweight portfolio typology — `name`, rich `description`, `image` — surfaced only as a card on the home "Disciplines" list and the Projects page, with no detail page of its own. The intended direction is to give Projects the same shape as Articles: individual `/projects/{slug}` detail pages with rich content, so a Project becomes a full content entity rather than a catalog card.

Recorded as **proposed** because the Project↔Article boundary must be resolved when this lands: if a Project gains a slug, body, and detail page, what still distinguishes it from an Article (audience, source, whether self-initiated writing belongs in one or the other)? The minimal current Project schema is deliberate and expected to grow — do not treat it as final.
