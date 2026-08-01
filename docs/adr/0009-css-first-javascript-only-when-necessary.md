# 9. CSS-first UI, JavaScript only when necessary

Date: 2026-07-26

## Status

Accepted.

## Context

Most of this site's interaction is presentational — reveals, theming, disclosure, layout response. Each of those has a well-known JavaScript answer and a newer platform answer, and reaching for the JavaScript one by default is how a content site ends up shipping a bundle it does not need and running layout work on the main thread.

## Decision

UI behaviour is implemented in CSS wherever the platform allows — scroll-driven animations, `@starting-style`, `light-dark()`/`color-scheme`, `interpolate-size`, container queries — and JavaScript is added only when an effect genuinely cannot be expressed in CSS. The motivation is performance (work off the main thread, less shipped JS) and resilience (graceful degradation, fewer moving parts), accepting a hard dependency on an evergreen/Chromium-forward baseline.

This is why reveal-on-scroll uses native scroll timelines rather than the GSAP already in the dependency tree ([ADR 0007](./0007-css-scroll-driven-reveal-animations.md)), and theming leans on `light-dark()`/`color-scheme` ([ADR 0005](./0005-theme-token-families-and-inline-bootstrap.md)) rather than JS. GSAP/JS remain only for the few interactions that truly need them (e.g. the menu open/close timeline, form micro-interactions).

## Consequences

- The baseline is a choice, not an accident: features are used without prefix stacks or polyfills, and a non-evergreen browser gets a degraded but readable page.
- Adding a React island is a decision that has to be argued, not a default — the modules guide states the same rule at the point of use.
- Some effects are harder to express this way than they would be in JavaScript. That cost is accepted; the escape hatch is real but has to be justified.
