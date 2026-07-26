# LightningCSS with light-dark() passthrough and error recovery

The Vite CSS transformer is LightningCSS configured with `exclude: Features.LightDark` and `errorRecovery: true`. `Features.LightDark` is excluded because LightningCSS downlevels `light-dark()` into an inherited-variable polyfill that breaks nested `color-scheme` inversion in production (dev looked fine) — excluding it emits native `light-dark()` untouched, which the theming layer (ADR 0005) depends on. `errorRecovery` is enabled because LightningCSS 1.33 rejects the valid `::search-text:current` selector and would otherwise fail the build.

Do not remove either flag: dropping the exclude reintroduces the production theme bug, and dropping error recovery breaks the build on that selector.
