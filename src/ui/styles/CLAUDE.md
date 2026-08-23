# src/ui/styles

The global cascade. Everything here is cross-cutting; per-component styling lives beside its component in `@modules/*`.

## Layer order

Declared once, in [`index.css`](./index.css):

```css
@layer reset, vendor, overrides, base, theme, global, modifiers, animations;
```

Cascade correctness depends on this order, so respect it. Every file opens by naming its slot and nothing else, either an `@layer` block or `layer()` on the `@import` for `vendor.css` (which only pulls in the cookie-consent package stylesheet), and no file re-declares the order:

| Folder / file | Layer |
| --- | --- |
| [`reset/reset.css`](./reset/reset.css) | `reset` |
| [`vendor/vendor.css`](./vendor/vendor.css) | `vendor` |
| [`vendor/overrides.css`](./vendor/overrides.css) | `overrides` |
| [`vendor/cookie-consent.css`](./vendor/cookie-consent.css) | `overrides.cookie-consent` (nested sub-layer) |
| [`base/base.css`](./base/base.css) | `base` |
| [`global/variables.css`](./global/variables.css) | `theme` |
| [`global/global.css`](./global/global.css), `reveal.css`, `slider.css` | `global` |
| [`global/modifiers.css`](./global/modifiers.css) | `modifiers` |
| [`global/animations.css`](./global/animations.css) | `animations` |

New files are wired through the folder's `index.css`, which `index.css` imports in layer order.

## Tokens (`global/variables.css`)

- **Colour**: an oklch base per family (`--primary-main`, `--neutral-main`) with light/dark steps derived via `color-mix`. The semantic tokens are the `light-dark()` pairs, and they are exactly `--ink`, `--ink-soft`, `--muted`, `--faint`, `--line`, `--line-soft`, `--gold`, `--gold-bright` and `--surface`: every one of them is censused here, so adding a tenth means editing this line. Add a step to a family rather than a one-off hex; no component stylesheet contains a hex literal today. See ADR 0005 / 0008.
- **Type scale**: fully derived. `--ratio: 1.25` builds the `-min` ladder, per-level `--font-growth-*` builds `-max`, and each `--font-size-*` is a `clamp()` between the two across `--vw-min`/`--vw-max`, wrapped in `round(nearest, …, --round-interval)` for baseline snapping. Consume `var(--font-size-h1…h6 | sm | xs)`; do not add a step outside the ratio. Two things escape the ladder, and only one of them is allowed to.
	- **Sanctioned:** the ladder is viewport-driven, so type that has to scale with its *container* opts out with a `cqi` `clamp()` instead. `.editorial-section-title` does it in `global.css`, and under `@modules` the components taking it are `aboutIntro`, `cities`, `columnsToggle`, `contactForm`, `contactIntro`, `errorLayer`, `form`, `input`, `menu`, `menuButton`, `myWork`, `projectSection`, `projectsIntro`, `testimonialsSlider`, `textarea` and `welcome`. That list is a census: reaching for a `cqi` clamp in a further component means adding it here. A converted one keeps its old fixed value as the clamp's floor, so nothing ever renders smaller than it used to.
	- **Neither, and deliberately so:** 2 further `font-size` declarations under `@modules` are neither on the ladder nor container-scaled, and they sit in `errorLayer`: both on `.error-layer__ghost`, `44vw` dropping to `60vw` below 640px. That pair scales *inversely*: the decorative glyph takes a larger share of a narrower screen. A `clamp()` grows with the available width and cannot express that, so the media query is the right tool here and these two are not debt. The docs test pins the count and the folder, so a third one cannot appear quietly.
- **Rhythm**: `--leading`, `--leading-heading`, `--leading-display`, `--rhythm`. Vertical spacing derives from `--rhythm`, not from arbitrary pixel margins.
- **Spacing**: a `--space-3xs…3xl` ramp of viewport clamps. Reach for a step before writing a margin; there is no token for "a bit more than `--space-m`", so round to the nearest step instead of inventing one.
- **Layout**: `--header-height`, `--global-max-width`, and a `--grid-*` set of named measures (`--grid-article`, `--grid-narrow`, `--grid-text`, `--grid-content`, `--grid-sidebar`, plus breakpoint-shaped ones). They are widths, not breakpoints: every use is a `max-width`/`width`, never a query condition, because a container query cannot read a custom property in its condition. Each measure is declared twice, once in `:root` and once as an `@property`, which is exactly how a dead one hides, so the docs test rejects any `--grid-*` nothing consumes.

## Colour scheme

`:root` is `color-scheme: light`; dark comes from `[data-theme="dark"]`, set before first paint by the bootstrap `core/components/head/Head.astro` renders from `themeToggle/utils/preference.ts`, with `prefers-color-scheme` as the fallback whenever the reader has chosen nothing; only a click on the toggle is persisted. Sections that invert against the page mix in the `inverted-color-scheme` block, which flips in both directions; the components that do are `blog`, `footer`, `latestArticles` and `relatedArticles`. The mix is a runtime contract as well as paint: `backgroundObserver` in `header/utils/interactions.ts` observes every `.inverted-color-scheme` on the page and inverts the logo and menu button while the sticky header's midline sits over one. So the header names no section's block class of its own, and a new inverting section needs no edit there.

That nested inversion is exactly what breaks when lightningcss downlevels `light-dark()` into an inherited-var polyfill, hence `Features.LightDark` in `lightningcss.exclude` in [`astro.config.ts`](../../../astro.config.ts). Don't remove it; dev looks fine and prod doesn't. See ADR 0006.

## Conventions

- **BEM throughout** (ADR 0014). Modifiers are fused onto their block (`.theme-toggle--toggled`, `.reveal--fade`), never standalone `.--modifier` classes and never `is-`/`has-` state classes. A modifier also never floats free of its block: `.columns-toggle__label--single` exists with no rules on `.columns-toggle__label` at all, but the markup still carries both, and the docs test rejects a modifier whose block appears nowhere. The one stylesheet exempt from all of this is `vendor/cookie-consent.css`, whose selectors (`.pm__section--expandable.is-expanded`) are vanilla-cookieconsent's DOM and not ours to rename.
- **Two utility files, split by layer, not by kind.** Both hold blocks meant to be *mixed* onto a component, so "is it cross-block?" will not tell you where to put one; the cascade slot will. Behaviour that has to beat component CSS by layer goes in `global/modifiers.css` (`@layer modifiers`, censused under [Mixed-in utilities](#mixed-in-utilities)); the typographic and layout vocabulary goes in `global.css` (`@layer global`, listed below). Component stylesheets are unlayered and beat both, so a component can always override a mix for itself.
- **The `page` block** sits on `<html>` (`BaseLayout.astro`), with `<main>` as `page__main`. It carries two things: the route (`page--home`, `page--article`…) and page-wide state (`page--menu-open`, toggled by `header/utils/interactions.ts`). Anything that must restyle several unrelated blocks at once belongs here and is consumed by descent (`.page--menu-open .site__logo { … }`) rather than by tagging each element with its own copy of the state.
- **Page containers**: `base.css` names a container on `html.page--<route>` as `<route>-page` (`home-page`, `article-page`, `tags-page`…), always with `inline-size scroll-state`. Component CSS queries those names instead of media queries. The naming is mechanical, so the only interesting facts are the routes that get *no* container: `tag`, `404` and `500`. There is deliberately no `page--tag`: `getPage` resolves `/tags/<slug>` to `tags`, because `PAGES_ROUTES.TAGS` is declared before `TAG` and the first route the path sits *within* wins, so tag detail pages share the `tags-page` container. If you ever want them separated, reorder `PAGES_ROUTES` first and expect `_tag.css` to need updating. "Within" is `isWithin` in `@modules/core/utils/pathname`, shared with `siteChrome`: it matches whole path segments, so `/tags-manifesto` is not under `/tags`. It used to be a bare `includes`, which meant `getPage` and `siteChrome` answered that URL differently, one served the under-construction placeholder while the other stamped `page--tags` on it. `404` and `500` get none because `errorLayer` sizes itself off the viewport rather than off a container.
- **`global.css` utilities.** The editorial set, `.editorial-eyebrow`, `.editorial-kicker`, `.editorial-section-title`, `.editorial-headline`, `.editorial-meta`, `.editorial-cta`: is the canonical typographic vocabulary; reach for it before writing new headline styles. Beside it live `.common-wrapper` (the max-width centring wrapper), `.stretch-arrow` (the CTA arrow whose `d` morphs on hover), the font switches `.font-serif` / `.font-sans-serif`, a small atomic layer, `.grid`, `.flex`, `.relative`, `.row-wrap`, `.column-wrap`, `.column-nowrap`, `.justify-flex-start`, `.justify-flex-end`, `.justify-space-between`, `.justify-center`, `.align-center`, `.align-baseline`: and `.section-title`, which is the one block here that is *not* canonical (next bullet). This list is the census: every block `global.css` declares is named here, and adding one without naming it fails the docs test. So does declaring one nothing uses, every block above has at least one call site, and some of those sites are not markup, so grep the whole of `src` before calling one dead (`.align-baseline` looks unused until you find it in the heading HTML that `articleDTO`'s content renderer emits).
- **Two section-title vocabularies, and `.editorial-section-title` is the canonical one.** `.section-title` (letter-spacing, uppercase, centred; it sets no family, size or colour) predates `.editorial-section-title` (display family, a `cqi` clamp, `--ink`, baseline-snapped leading), and they do not render alike. Use `.editorial-section-title` for new section headings. `.section-title` survives only because collapsing the two is a visual change to every component still on it, and those are `latestArticles`, `relatedArticles` and contact's `tabs`. That one used to dress a level-four heading, which is why the display treatment was said to break it; it is a level two now, because a heading level was being chosen for its type rather than its rank, so the reason the holdout survives is the other two rather than this one. That list is the whole of it and the docs test censuses it, so it can only shrink: retire one by moving its markup to `.editorial-section-title` and striking it from that sentence, and when the sentence empties, delete `.section-title` from `global.css`.
- `reveal.css` holds the scroll-driven reveal animations (`.reveal`, `.reveal--fade`, `.reveal--on-load`) with a `prefers-reduced-motion` opt-out. Fusing the modifier drops these to one class of specificity, so they only win by source order, keep them after `.reveal` in the file. See ADR 0007.
- Modern CSS is fair game (`light-dark()`, `interpolate-size`, `color-mix`, oklch, `round()`, container queries, `@starting-style`). Chromium-forward, no prefix stacks.
- If a rule only ever applies to one component, it does not belong here.

## Mixed-in utilities

`global/modifiers.css` is the whole of `@layer modifiers`: cross-block behaviour that BEM treats as a *block used as a mix*, applied next to a component's own block class rather than copied into it. The table is the census, every block that stylesheet declares has a row here, and adding one without a row fails the docs test.

| Utility | What it does |
| --- | --- |
| `underline-on-hover` | Grows a `background-image` underline from 0% to 100% on hover; the fused `underline-on-hover--active` pins it open. |
| `clickable` | Pointer cursor and a press-scale on `:active`, skipping `canvas` and disabled controls. |
| `inverted-color-scheme` | Flips `color-scheme` against the page in both directions, for the sections censused under [Colour scheme](#colour-scheme), and is what the header watches to invert with them. |
| `current-page` | Paints the entry for the route you are already on in `--primary-main` (header links, the last breadcrumb). |
| `visually-hidden` | takes an element out of the page but leaves it in the accessibility tree and the tab order |
| `item-wrapper` | Gives a list item a positioning context, so a card's stretched `inset: 0` link (`.article-card__link`) covers the whole item instead of the nearest positioned ancestor. |
