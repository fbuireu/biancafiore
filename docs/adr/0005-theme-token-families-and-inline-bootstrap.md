# 5. Two theming token families + render-blocking theme bootstrap

Date: 2026-07-26

## Status

Accepted.

## Context

Two different theming needs pull in opposite directions. Some tokens only have to follow the OS/user scheme, which native `light-dark()` (driven by `color-scheme`) expresses exactly. Others must invert independently of `color-scheme` — flipping `--black`/`--white` and recomputing `color-mix` ramps for sections that deliberately run against the page — and a single mechanism could not express both without fighting inheritance.

Separately, the theme is persisted only in `localStorage` and pages can be prerendered/edge-cached, so the server cannot know which theme to render.

## Decision

Theming uses two token families on purpose: semantic tokens defined with native `light-dark()`, and a second set redefined under `[data-theme="dark"]` for the values that must invert on their own.

A render-blocking `is:inline` script in `<head>` sets `data-theme` and `color-scheme` before first paint, to prevent a fresh-tab flash. `color-scheme` forcing was removed from the menu so it follows the active theme instead of pinning to one.

## Consequences

- The bootstrap script is render-blocking on purpose. It is small, and it is the only way to avoid the flash on a page the server rendered without knowing the theme ([ADR 0011](./0011-hybrid-rendering-prerender-content-ssr-dynamic.md)).
- Native `light-dark()` has to survive the build untouched, which is what forces the LightningCSS exclusion ([ADR 0006](./0006-lightningcss-native-css-passthrough.md)).
- A new colour token has to go into whichever family matches its behaviour; putting it in the wrong one produces a token that looks correct until a section inverts.
