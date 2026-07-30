# src/ui/styles

The global cascade. Everything here is cross-cutting; per-component styling lives beside its component in `@modules/*`.

## Layer order

Declared once, in `index.css`:

```css
@layer reset, vendor, overrides, base, theme, global, modifiers, animations;
```

Cascade correctness depends on this order — respect it. Every file opens with exactly one `@layer` block matching its slot, and no file re-declares the order:

| Folder / file | Layer |
| --- | --- |
| `reset/reset.css` | `reset` |
| `vendor/vendor.css` | `vendor` |
| `vendor/overrides.css` | `overrides` |
| `vendor/cookie-consent.css` | `overrides.cookie-consent` (nested sub-layer) |
| `base/base.css` | `base` |
| `global/variables.css` | `theme` |
| `global/global.css`, `reveal.css`, `slider.css` | `global` |
| `global/modifiers.css` | `modifiers` |
| `global/animations.css` | `animations` |

New files are wired through the folder's `index.css`, which `index.css` imports in layer order.

## Tokens (`global/variables.css`)

- **Colour**: an oklch base per family (`--primary-main`, `--neutral-main`) with light/dark steps derived via `color-mix`. Semantic tokens (`--ink`, `--ink-soft`, `--muted`, `--faint`, `--line`, `--gold`, `--surface`) are `light-dark()` pairs. Add a step to a family rather than a one-off hex. See ADR 0005 / 0008.
- **Type scale**: fully derived — `--ratio: 1.25` builds the `-min` ladder, per-level `--font-growth-*` builds `-max`, and each `--font-size-*` is a `clamp()` between the two across `--vw-min`/`--vw-max`, wrapped in `round(nearest, …, --round-interval)` for baseline snapping. Consume `var(--font-size-h1…h6 | sm | xs)`; never hardcode a size and never add a step outside the ratio.
- **Rhythm**: `--leading`, `--leading-heading`, `--leading-display`, `--rhythm`. Vertical spacing derives from `--rhythm`, not from arbitrary pixel margins.
- **Layout**: `--header-height`, `--global-max-width`.

## Colour scheme

`:root` is `color-scheme: light`; dark comes from `[data-theme="dark"]` (persisted, bootstrapped inline in `core/components/head/Head.astro`) with `prefers-color-scheme` as the fallback. Sections that invert against the page mix in the `inverted-color-scheme` block (footer, latest/related articles), which flips in both directions.

That nested inversion is exactly what breaks when lightningcss downlevels `light-dark()` into an inherited-var polyfill — hence `Features.LightDark` in `lightningcss.exclude` in `astro.config.ts`. Don't remove it; dev looks fine and prod doesn't. See ADR 0006.

## Conventions

- **BEM throughout** (ADR 0014). Modifiers are fused onto their block (`.theme-toggle--toggled`, `.reveal--fade`), never standalone `.--modifier` classes. The cross-block utilities BEM treats as *blocks used as a mix* live in `global/modifiers.css` and are listed under [Mixed-in utilities](#mixed-in-utilities).
- **The `page` block** sits on `<html>` (`BaseLayout.astro`), with `<main>` as `page__main`. It carries two things: the route (`page--home`, `page--article`…) and page-wide state (`page--menu-open`, toggled by `header/utils/interactions.ts`). Anything that must restyle several unrelated blocks at once belongs here and is consumed by descent — `.page--menu-open .site__logo { … }` — rather than by tagging each element with its own copy of the state.
- **Page containers**: `base.css` names a container per route on `html.page--<route>` (`home-page`, `article-page`, `tags-page`…) with `inline-size scroll-state`. Component CSS queries those names instead of media queries. There is deliberately no `page--tag`: `getPage` resolves `/tags/<slug>` to `tags`, because `PAGES_ROUTES.TAGS` is declared before `TAG` and the lookup uses `includes`. Tag detail pages therefore share the `tags-page` container — if you ever want them separated, reorder `PAGES_ROUTES` first and expect `_tag.css` to need updating.
- **Editorial utilities** in `global.css` (`.editorial-eyebrow`, `.editorial-kicker`, `.editorial-section-title`, `.editorial-headline`, `.editorial-meta`, `.editorial-cta`) are the shared typographic vocabulary — reach for them before writing new headline styles.
- `reveal.css` holds the scroll-driven reveal animations (`.reveal`, `.reveal--fade`, `.reveal--on-load`) with a `prefers-reduced-motion` opt-out. Fusing the modifier drops these to one class of specificity, so they only win by source order — keep them after `.reveal` in the file. See ADR 0007.
- Modern CSS is fair game (`light-dark()`, `interpolate-size`, `color-mix`, oklch, `round()`, container queries, `@starting-style`). Chromium-forward, no prefix stacks.
- If a rule only ever applies to one component, it does not belong here.

## Mixed-in utilities

`global/modifiers.css` is the whole of `@layer modifiers`: cross-block behaviour that BEM treats as a *block used as a mix*, applied next to a component's own block class rather than copied into it. The table is the census — every block that stylesheet declares has a row here, and adding one without a row fails the docs test.

| Utility | What it does |
| --- | --- |
| `underline-on-hover` | Grows a `background-image` underline from 0% to 100% on hover; the fused `underline-on-hover--active` pins it open. |
| `clickable` | Pointer cursor and a press-scale on `:active`, skipping `canvas` and disabled controls. |
| `inverted-color-scheme` | Flips `color-scheme` against the page in both directions, for sections that invert (footer, latest/related articles). |
| `current-page` | Paints the entry for the route you are already on in `--primary-main` (header links, the last breadcrumb). |
| `item-wrapper` | Gives a list item a positioning context, so a card's stretched `inset: 0` link (`.article-card__link`) covers the whole item instead of the nearest positioned ancestor. |
