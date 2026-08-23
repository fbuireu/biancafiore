# 6. LightningCSS with light-dark() passthrough and error recovery

Date: 2026-07-26

## Status

Accepted.

## Context

LightningCSS downlevels `light-dark()` into an inherited-variable polyfill. That polyfill breaks nested `color-scheme` inversion in production while dev looks fine, which is the worst shape a bug can have: invisible until deployed. The theming layer depends on native `light-dark()` reaching the browser untouched ([ADR 0005](./0005-theme-token-families-and-inline-bootstrap.md)).

Separately, LightningCSS 1.33 rejects the valid `::search-text:current` selector, which fails the build outright.

## Decision

The Vite CSS transformer stays LightningCSS, configured with `exclude: Features.LightDark` and `errorRecovery: true` in [`astro.config.ts`](../../astro.config.ts). Excluding the feature emits native `light-dark()` untouched; error recovery keeps the rejected selector from breaking the build.

## Consequences

- Do not remove either flag: dropping the exclude reintroduces the production theme bug, and dropping error recovery breaks the build on that selector.
- Both flags compensate for upstream behaviour, so both are candidates for removal once LightningCSS changes; both need a production check, not a dev check, before that happens.
- The failure mode is silent in dev, which is why it is repeated as a Gotchas bullet in [`CLAUDE.md`](../../CLAUDE.md) and in the styles guide instead of living only here.
