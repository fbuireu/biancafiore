# Two theming token families + render-blocking theme bootstrap

Theming uses two token families on purpose: semantic tokens defined with native `light-dark()` (driven by `color-scheme`) and a second set redefined under `[data-theme="dark"]`. The `light-dark()` set covers tokens that only need to follow the OS/user scheme, while `[data-theme]` overrides handle values that must invert independently of `color-scheme` (e.g. flipping `--black`/`--white` and recomputing `color-mix` ramps) — a single mechanism could not express both without fighting inheritance.

Because the theme is persisted only in `localStorage` and pages can be prerendered/edge-cached, the server cannot know the theme, so a render-blocking `is:inline` script in `<head>` sets `data-theme` and `color-scheme` before first paint to prevent a fresh-tab flash. `color-scheme` forcing was removed from the menu so it follows the active theme instead of pinning to one.
