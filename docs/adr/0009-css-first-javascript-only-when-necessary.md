# CSS-first UI, JavaScript only when necessary

UI behaviour is implemented in CSS wherever the platform allows — leaning on modern, evergreen features (scroll-driven animations, `@starting-style`, `light-dark()`/`color-scheme`, `interpolate-size`, container queries) — and JavaScript is added only when an effect genuinely cannot be expressed in CSS. The motivation is performance (work off the main thread, less shipped JS) and resilience (graceful degradation, fewer moving parts), accepting a hard dependency on an evergreen/Chromium-forward baseline.

This is why reveal-on-scroll uses native scroll timelines rather than the GSAP already in the dependency tree (ADR 0007), and theming leans on `light-dark()`/`color-scheme` (ADR 0005) rather than JS. GSAP/JS remain only for the few interactions that truly need them (e.g. the menu open/close timeline, form micro-interactions).
