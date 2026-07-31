# src/ui/modules

Feature areas. `about`, `article`, `articles`, `contact`, `home`, `legal`, `projects` map to routes; `core` is everything shared by more than one of them, plus what `src/pages` reaches for directly (`baseLayout`, `head`, `header`, `footer`, `seo`, `form`, `cookieConsent`, `themeToggle`, `articleCard`, `breadcrumbs`, `errorLayer`…).

Imported as `@modules/<feature>/components/<name>/<Component>.astro`.

## Component convention

Every component is a folder holding a co-located pair:

```
<feature>/components/<camelCaseName>/
  <PascalCase>.astro      # or .tsx for a React island
  <kebab-case>.css        # imported by the component: import "./blog.css"
  utils/                  # helpers used only by this component
```

The folder is camelCase, the component PascalCase, the stylesheet kebab-case of the same name — no folder deviates, and the docs test holds it that way. Feature-wide helpers that aren't a component live in `<feature>/utils/` (e.g. `core/utils/jsonLd`), and `about` additionally carries a `hooks/` folder for the one React hook shared inside that feature.

Two wrinkles the shape above doesn't show:

- **React folders carry an `index.ts` barrel, Astro folders don't.** Every React component is imported through `@modules/.../<name>`, whose `index.ts` re-exports `./<PascalCase>`; Astro components are imported by their full `.astro` path. The split is not decoration — it is what lets a React island be imported without the extension the Astro compiler needs.
- **`core/components/form/` is a grouping folder, not a component.** It holds `input`, `recaptcha` and `textarea` plus a `shared.css` the three of them `@import` from their own stylesheets. That is the only shared stylesheet in the tree; reach for it only if you are adding a fourth form control.

## Styling

- **Component CSS is not scoped by Astro** — it's a plain global stylesheet imported next to the component, so the class names are the only isolation there is. Namespace with a block class named after the component and BEM elements under it: `.blog`, `.blog__inner`, `.article-card__byline`. Not one component uses an Astro `<style>` block, and the docs test keeps it that way: a `<style>` block *would* be scoped, so a single one would make "the class names are the only isolation" quietly false for the next reader.
- **Modifiers are BEM modifiers** (ADR 0014): `block--modifier` or `block__element--modifier`, fused into a single class (`.contact-tab--active`, `.contact-form__submit--loading`, `.article-card__item--landscape`). No standalone `.--modifier` classes, and no `is-`/`has-` prefixes — that's SMACSS vocabulary, not BEM. A modifier is also never a bare descendant standing in for one (`.card .active`): the block goes on the element too, even where it carries no rules, as `.columns-toggle__label--single` does.
- **Cross-block behaviour is a block, mixed in**, applied alongside the component's own block — a BEM *mix*: `class="navigation__menu__link underline-on-hover clickable"`. The mixes live in two files under `@styles/global`, and which one is decided by cascade layer rather than by subject matter: behavioural mixes in `modifiers.css` (`@layer modifiers`), typographic and layout ones in `global.css` (`@layer global`). Component stylesheets are unlayered, so they beat both without extra specificity, and a block may override a mix for itself — `menu.css` paints `.navigation__menu__link.current-page` gold rather than the `--primary-main` the mix gives it. Reach for one of the behavioural mixes before inventing a per-block duplicate:
	- `underline-on-hover` — a link or link-like button that underlines on hover
	- `clickable` — anything that responds to a press
	- `inverted-color-scheme` — a section that inverts against the page
	- `current-page` — the entry pointing at the route already being viewed
	- `item-wrapper` — a list item whose card link stretches over the whole item
- **State owned by the page is a `page` modifier.** Anything that flips several unrelated blocks at once hangs off `<html>` and is consumed by descent, not by tagging each element: `.page--menu-open .reading-progress { … }`. See `@styles/CLAUDE.md`.
- Consume tokens and shared utilities from `@styles` (`var(--font-size-h3)`, `var(--rhythm)`, `.editorial-headline`, `.reveal`, `.underline-on-hover`). Don't reinvent typography.
- Prefer container queries against the page container declared in `styles/base/base.css` (`@container home-page (width <= 960px)`) over viewport media queries.
- A style that only this component uses never goes into `@styles/global` — that folder is for genuinely cross-cutting rules.

## Islands

React is used only where interaction demands it: `about/worldGlobe` (three / react-globe.gl), `contact/contactForm` + `contactFormProvider` (react-hook-form), `core/cookieConsent`, `core/form/*`, `core/spinner`. Everything else is `.astro`, rendered on the server.

Writing a React component does not create an island. There are only three hydration roots in the whole site — `WorldGlobe` in `LittleMoreOfMe.astro`, `ContactFormProvider` in `Tabs.astro`, `CookieConsent` in `Footer.astro` — and every one is `client:only="react"`, never `client:load`, because none of the three survives a server render: `WorldGlobe` reads `window.innerWidth` in a `useState` initialiser, and `CookieConsent` and `ContactFormProvider` mount browser-only packages (`vanilla-cookieconsent`, `react-google-recaptcha-v3`). The other React files are children of those three and hydrate with their root. So an island costs a hydration directive at a call site, which is the moment to ask whether CSS or an Astro component would do (ADR 0009).

## Data

Components read content through `getCollection`/`getEntry` from `astro:content`, never by calling Contentful or `@infrastructure` directly — the docs test fails on either import anywhere under `src/ui`. Server mutations go through the generated `astro:actions` client, not through `@actions` itself: nothing here imports that alias, and `ContactForm.tsx` calling `actions.contact` is the only mutation in the tree.
