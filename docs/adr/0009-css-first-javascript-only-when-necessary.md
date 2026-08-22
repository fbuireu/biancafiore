# 9. An evergreen, Chromium-forward browser baseline, and CSS-first UI on top of it

Date: 2026-07-26

Amended: 2026-08-22, to record the baseline as the decision rather than as a clause inside it.

## Status

Accepted.

## Context

Most of this site's interaction is presentational: reveals, theming, disclosure, layout response. Each of those has a well-known JavaScript answer and a newer platform answer, and the platform answers are not evenly supported. `animation-timeline: view()`, `@starting-style`, `light-dark()`, `interpolate-size`, `d` as an animatable property, `attr()` with a type: these are the features the design leans on, and reaching for all of them at once is a decision about who can see the site properly, not a coding preference.

Writing it down as "prefer CSS, add JavaScript only when necessary" made the reversible half the headline and the irreversible half a clause. The preference can be revisited per component. The baseline cannot: by the time a dozen components depend on scroll timelines, supporting a browser without them means rebuilding them, not adding a polyfill.

## Decision

**The supported baseline is evergreen and Chromium-forward.** Modern CSS is used without prefix stacks, feature queries beyond a graceful `@supports` fallback, or polyfills, and the build target is `esnext`.

CSS-first UI follows from that rather than standing beside it: where the platform expresses an effect, it is expressed in CSS, and JavaScript is added only when it genuinely cannot be. That is why reveal-on-scroll uses native scroll timelines rather than the GSAP already in the dependency tree ([ADR 0007](./0007-css-scroll-driven-reveal-animations.md)), and why theming leans on `light-dark()` / `color-scheme` ([ADR 0005](./0005-theme-token-families-and-inline-bootstrap.md)). GSAP and hand-written JavaScript remain for the few interactions that need them, such as the menu open/close timeline and the form micro-interactions.

## Consequences

- **A visitor on Safari or Firefox gets a working page, not the designed one.** Reveals resolve to the un-animated end state through `@supports`, so nothing is hidden; the scroll-driven stagger, the `interpolate-size` transitions and the fluid type ladder degrade to their static values. That is the accepted cost, and it is a real one for a portfolio whose audience includes editors and clients on whatever browser their employer installed.
- The failure mode is invisible in development, because development happens in Chromium. Anything that depends on the baseline has to be checked in a second engine before it is trusted; Playwright's `webkit` project is the only place that happens today, and the site's CSP already made that project lie once (see the `upgrade-insecure-requests` gotcha in `CLAUDE.md`).
- Adding a React island is a decision that has to be argued, not a default; the modules guide states the rule at the point of use.
- Some effects are harder to express this way than they would be in JavaScript, and the escape hatch is real but has to be justified.
- **The baseline is not a licence to reach for a feature nothing supports on the design's own terms.** The slider dots were `::scroll-marker` and `scroll-marker-group` for a while, and every caller opted out with `scroll-marker-group: none`, so the site shipped the platform answer and used none of it. They are ordinary buttons now, in `SliderShell`, with the active one tracked in script. That is the CSS-first rule losing a round, and it is worth recording as one: a platform feature the design turns off everywhere is not the platform answer, it is dead weight with a standards badge on it.
