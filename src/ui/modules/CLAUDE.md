# src/ui/modules

Feature areas. `about`, `article`, `articles`, `contact`, `home`, `legal`, `projects` map to routes; `core` is everything shared by more than one of them (layout, header, footer, seo, form, cookieConsent, themeToggle, articleCard, breadcrumbs…).

Imported as `@modules/<feature>/components/<name>/<Component>.astro`.

## Component convention

Every component is a folder holding a co-located pair:

```
<feature>/components/<camelCaseName>/
  <PascalCase>.astro      # or .tsx for a React island
  <kebab-case>.css        # imported by the component: import "./blog.css"
  utils/                  # helpers used only by this component
```

The folder is camelCase, the component PascalCase, the stylesheet kebab-case of the same name. Feature-wide helpers that aren't a component live in `<feature>/utils/` (e.g. `core/utils/jsonLd`).

## Styling

- **Component CSS is not scoped by Astro** — it's a plain global stylesheet loaded next to the component, so the class names are the only isolation there is. Namespace with a block class named after the component and BEM elements under it: `.blog`, `.blog__inner`, `.article-card__byline`.
- **Modifiers are BEM modifiers**: `block--modifier` or `block__element--modifier`, fused into a single class (`.contact-tab--active`, `.contact-form__submit--loading`, `.article-card__item--landscape`). No standalone `.--modifier` classes, and no `is-`/`has-` prefixes — that's SMACSS vocabulary, not BEM.
- **Cross-block behaviour is a block, mixed in.** Utilities used by unrelated blocks (`underline-on-hover`, `clickable`, `inverted-color-scheme`, `current-page`) live in `@styles/global/modifiers.css` as blocks of their own and are applied alongside the component's own block — a BEM *mix*: `class="navigation__menu__link underline-on-hover clickable"`. Reach for one of these before inventing a per-block duplicate.
- **State owned by the page is a `page` modifier.** Anything that flips several unrelated blocks at once hangs off `<html>` and is consumed by descent, not by tagging each element: `.page--menu-open .reading-progress { … }`. See `@styles/CLAUDE.md`.
- Consume tokens and shared utilities from `@styles` (`var(--font-size-h3)`, `var(--rhythm)`, `.editorial-headline`, `.reveal`, `.underline-on-hover`). Don't reinvent typography.
- Prefer container queries against the page container declared in `styles/base/base.css` (`@container home-page (width <= 960px)`) over viewport media queries.
- A style that only this component uses never goes into `@styles/global` — that folder is for genuinely cross-cutting rules.

## Islands

React is used only where interaction demands it: `about/worldGlobe` (three / react-globe.gl), `contact/contactForm` + `contactFormProvider` (react-hook-form), `core/cookieConsent`, `core/form/*`, `core/spinner`. Everything else is `.astro`, rendered on the server. Adding an island means adding a hydration directive at the call site — default to CSS or an Astro component first (ADR 0009).

## Data

Components read content through `getCollection`/`getEntry` from `astro:content`, never by calling Contentful or `@infrastructure` directly. Server mutations go through `@actions`.
