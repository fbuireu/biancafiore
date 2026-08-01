# 7. Native CSS scroll-driven reveal animations, no JS library

Date: 2026-07-26

## Status

Accepted.

## Context

Reveal-on-scroll is the site's most-used effect, and the usual ways to get it — AOS, GSAP ScrollTrigger, a hand-rolled IntersectionObserver — all put per-element work on the main thread and ship JavaScript for something the platform now expresses natively. GSAP is already in the dependency tree for the menu timeline, so reaching for it would have been the path of least resistance.

## Decision

Reveals are built entirely with native CSS: `animation-timeline: view()` / named `view-timeline`, `@starting-style`, and a `data-reveal-index` stagger read via `attr()`. No reveal JavaScript of any kind. A `.--on-load` variant swaps the scroll timeline for a plain load transition so non-scrolling pages (e.g. 404/500) can still animate in.

This is a concrete instance of the project-wide CSS-first principle ([ADR 0009](./0009-css-first-javascript-only-when-necessary.md)): GSAP is in the dependency tree but deliberately not used for reveals.

## Consequences

- Requires a browser with scroll-driven animation support, which is the evergreen/Chromium-forward baseline the project already accepts ([ADR 0009](./0009-css-first-javascript-only-when-necessary.md)).
- Degrades to fully-visible rather than to nothing: an `@supports` fallback and `prefers-reduced-motion` both resolve to the un-animated end state, so content is never hidden by a missing feature.
- The modifiers are fused (`.reveal--fade`), so they carry the same specificity as `.reveal` and only win by source order — they must stay after it in `reveal.css` ([ADR 0014](./0014-bem-class-naming.md)).
