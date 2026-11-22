# Styling

CSS-first, evergreen and Chromium-forward. Modern features are used freely (`light-dark()`, `interpolate-size`, `color-mix`, oklch). The JavaScript build targets `esnext`; the CSS is transformed by lightningcss for the browsers Vite supports by default, which is why `light-dark()` has to be kept out of that transform (below). JavaScript is reached for only when CSS genuinely cannot express the thing, which [ADR 0009](https://github.com/fbuireu/biancafiore/blob/main/docs/adr/0009-css-first-javascript-only-when-necessary.md) records as a decision rather than a preference.

Global, cross-cutting styling lives in one folder; per-component styling lives beside its component.

---

## The cascade layers

Declared once, and nothing re-declares the order:

```css
@layer reset, vendor, overrides, base, theme, global, modifiers, animations;
```

Cascade correctness depends on that order. Every file opens by naming its slot and nothing else. New files are wired through their folder's index, which the root stylesheet imports in layer order.

---

## Tokens

The token families are derived rather than listed.

| Family | How it works |
|---|---|
| **Colour** | An oklch base per family with light and dark steps derived through `color-mix`. The semantic tokens are the `light-dark()` pairs |
| **Type scale** | Fully derived: a ratio builds the minimum ladder, per-level growth builds the maximum, and each size is a `clamp()` between them, rounded for baseline snapping |
| **Rhythm** | Vertical spacing derives from a rhythm token, not from arbitrary pixel margins |
| **Spacing** | A ramp of viewport clamps |
| **Layout** | Named measures, which are widths and never query conditions: a container query cannot read a custom property in its condition |

The type ladder is viewport-driven, so type that must scale with its **container** opts out with a container-relative clamp instead. That is sanctioned, and the components doing it are a census in the styles guide: reaching for one in a further component means adding it to that list. The docs test pins those lists, so a new exception cannot appear quietly.

---

## Colour scheme

The root is light; dark comes from a `data-theme` attribute set before first paint by an inline bootstrap, and the site stays light until the reader picks dark, whatever the operating system prefers. Only a click on the toggle is persisted. [ADR 0005](https://github.com/fbuireu/biancafiore/blob/main/docs/adr/0005-theme-token-families-and-inline-bootstrap.md) covers the token families and why the bootstrap is inline; [ADR 0008](https://github.com/fbuireu/biancafiore/blob/main/docs/adr/0008-unregistered-property-color-tokens.md) covers the unregistered colour properties.

Sections that invert against the page mix in an inversion block that flips in both directions. That mix is a runtime contract as well as paint: an observer watches every inverting section and flips the logo and menu button while the midline of the sticky header's bar sits over one. The header therefore names no section's class of its own, and a new inverting section needs no edit there.

**That nested inversion is what breaks in production**, and only in production: lightningcss downlevels `light-dark()` into an inherited-variable polyfill that cannot express it. The feature is excluded from the transformer for exactly this reason. Dev looks fine and prod does not, so do not remove the exclusion to tidy the config. [ADR 0006](https://github.com/fbuireu/biancafiore/blob/main/docs/adr/0006-lightningcss-native-css-passthrough.md) has it.

---

## Safe areas

The page asks the browser to draw edge to edge on a phone or tablet with a notch, a status bar or a home indicator, and every element pinned to a screen edge keeps clear of the part of that edge the hardware covers. Four tokens carry the insets the browser reports, each of them zero on a desktop and on a phone with no cutout, so the page looks the same there.

- **An element that already keeps a distance from an edge** takes the larger of that distance and the inset: the scroll-to-top button, the skip link, the cookie banner and a section's horizontal padding.
- **An element flush with an edge** keeps its position and pads its content by the inset, so its background still reaches the edge. The sticky header grows by the top inset, the full-screen menu pads its panel, the footer pads its bottom, and the measure every full-bleed band wraps its content in pads its sides, so a band's background runs under a landscape notch and its text does not.

The styles guide has the tokens, the rule for a component that keeps its own gutter, and what the docs test holds.

---

## Naming

BEM, recorded in [ADR 0014](https://github.com/fbuireu/biancafiore/blob/main/docs/adr/0014-bem-class-naming.md). Scroll-driven reveal animations are CSS rather than a library, in [ADR 0007](https://github.com/fbuireu/biancafiore/blob/main/docs/adr/0007-css-scroll-driven-reveal-animations.md).

---

## Where the rules are

How styles are written, from BEM blocks to tokens and reveal animations, is in [`CODING_STANDARDS.md`](https://github.com/fbuireu/biancafiore/blob/main/CODING_STANDARDS.md), and the layer order, the token censuses and the gotchas are in the styles guide beside the stylesheets.
