# 7. Native CSS scroll-driven reveal animations, no JS library

Date: 2026-07-26

## Status

Accepted.

## Context

Reveal-on-scroll is the site's most-used effect, and the usual ways to get it (AOS, GSAP ScrollTrigger, a hand-rolled IntersectionObserver) all put per-element work on the main thread and ship JavaScript for something the platform now expresses natively. GSAP is already in the dependency tree for the menu timeline, so reaching for it would have been the path of least resistance.

## Decision

Reveals are built entirely with native CSS: `animation-timeline: view()` / named `view-timeline`, `@starting-style`, and a `data-reveal-index` stagger read via `attr()`. No reveal JavaScript of any kind. A `.--on-load` variant swaps the scroll timeline for a plain load transition so non-scrolling pages (e.g. 404/500) can still animate in.

A view timeline *scrubs*: the animation is a function of scroll position, so scrolling back up plays it backwards and the element un-reveals. For the single decorative elements `.reveal` dresses that is the intended reading of the effect, and it is what lets the whole mechanism sit on one element with no wrapper. It is the wrong reading for a card in a listing, where the reveal is an entrance and reversing it makes a page the reader is scanning flicker. `.reveal-once` is the second mechanism, added for the listing grids on `/articles`, `/tags` and `/tags/<slug>`: a wrapper carries the `view()` timeline and animates a registered `--in-view` custom property from `false` to `true`, and its children run an ordinary time-based animation held at `animation-play-state: paused` until `@container reveal-once style(--in-view: true)` sets it `running`. A time-based animation that has reached its end stays there when it is paused again, so the reveal fires once and holds. The stagger moves with it, from `animation-range-start` offsets to an `animation-delay` the page's own `nth-child` rule indexes, because a paused animation does not burn its delay either. It is a second mechanism, not a second vocabulary: it re-declares the same tuning custom properties and runs the same `reveal-up` keyframe.

The state has to cross an element boundary, and an element cannot style-query itself, so `.reveal-once` requires a wrapper with element children and animates `> *` rather than a class on the card. That keeps `ArticleCard`, which renders a stretched link and an `<article>` as siblings with no root of its own, reusable on the pages that do not reveal it.

This is a concrete instance of the project-wide CSS-first principle ([ADR 0009](./0009-css-first-javascript-only-when-necessary.md)): GSAP is in the dependency tree but deliberately not used for reveals.

## Consequences

- Requires a browser with scroll-driven animation support, which is the evergreen/Chromium-forward baseline the project already accepts ([ADR 0009](./0009-css-first-javascript-only-when-necessary.md)).
- Degrades to fully-visible rather than to nothing: an `@supports` fallback and `prefers-reduced-motion` both resolve to the un-animated end state, so content is never hidden by a missing feature.
- The two mechanisms are a real cost: a reader has to know which one a call site wants, and the answer is structural rather than aesthetic (a leaf element can only take `.reveal`). The guide states the rule at the point of use.
- `.reveal-once` depends on style container queries as well as scroll-driven animations. In practice a browser that ships one ships the other, and the `@supports (animation-timeline: view())` guard resolves to the visible end state either way, but the guard tests only half of what the mechanism needs.
- The modifiers are fused (`.reveal--fade`), so they carry the same specificity as `.reveal` and only win by source order; they must stay after it in [`reveal.css`](../../src/ui/styles/global/reveal.css) ([ADR 0014](./0014-bem-class-naming.md)).
