# Native CSS scroll-driven reveal animations, no JS library

Reveal-on-scroll effects are built entirely with native CSS: `animation-timeline: view()` / named `view-timeline`, `@starting-style`, and a `data-reveal-index` stagger read via `attr()`, with no AOS, GSAP ScrollTrigger, or IntersectionObserver JavaScript. This keeps reveals off the main thread and out of the JS bundle, degrading gracefully (an `@supports` fallback and `prefers-reduced-motion` both resolve to fully-visible), at the cost of requiring a browser that supports scroll-driven animations.

A `.--on-load` variant swaps the scroll timeline for a plain load transition so non-scrolling pages (e.g. 404/500) can still animate in.

This is a concrete instance of the project-wide CSS-first principle (ADR 0009): GSAP is in the dependency tree but deliberately not used for reveals.
