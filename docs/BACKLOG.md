# Backlog

Ideas not yet scheduled. This list used to live as a block of `// todo:` comments in `src/pages/index.astro`, which the *No code comments* convention rules out and which no reader of that page would look for. Items are removed when they ship or when they are decided against; an item that turns into a real decision becomes an ADR instead.

## Open decisions

- **Do Projects become sluggable content with pages of their own?** [ADR 0010](./adr/0010-projects-as-first-class-content.md) is Proposed and blocked on a glossary question: what distinguishes a Project from an Article once it has a slug, a body and a page. Until `CONTEXT.md` answers that, a Project stays a fragment on `/projects` and has no canonical URL of its own.
- **Does the wrangler deploy-message truncation deserve an ADR?** It is a paragraph at the bottom of `CLAUDE.md` today, and it constrains CI permanently: the annotation is passed explicitly so nothing about how a commit is written can reach it.

## Content and features

- Live collections, for everything except Articles.
- Search: Algolia with filters and URL-encoded filter state ([Contentful integration](https://www.algolia.com/developers/contentful-search-algolia/)). Blocked on the Wrangler webhook.
- A comments section.
- A like system ([reference](https://twitter.com/jh3yy/status/1740501273009389943)).
- The Author's resume as a PDF on About.
- Multi-language.

## Design and motion

- An SVG background animation driven by scroll offset.
- Small transitions and micro-animations, including small icons for reading time and tags.
- A layout that reads as two pages ([reference](https://www.behance.net/gallery/177718861/Photography-Portfolio-Layout-Download)).
- A `print` media query.

## Platform

- Cloudinary for the heavy assets.

## Known duplication, not yet worth the risk

- **The stretch-arrow hover morph is written seven times.** `global.css` (`.editorial-cta`), `slider.css` (`.slider__btn`), `link-with-arrow.css`, `scroll-top.css`, `article-card.css`, `world-globe.css` and `_404.css` each set `d: var(--stretch-arrow-shaft-hover)` and `d: var(--stretch-arrow-tip-hover)` on hover. Six of the seven would collapse into one `@layer modifiers` block mixed in as a class on the hovering element, the way `underline-on-hover` already is. The seventh, `article-card`, is triggered by a sibling selector (`.article-card__link:is(:hover, :focus-visible) ~ .article-card__item`) rather than by the element's own `:hover`, so one mix cannot express it; deciding what to do about that case is what this is waiting on. The surrounding arrow boxes have already drifted (`translate: -7px 0` vs `-6px 0`, `0.35s` vs `0.3s`).
- **The globe does not follow the theme.** `about/components/worldGlobe/const.ts` hardcodes `#d4a259` and `#f7ecd6`, which are `--gold` and `--surface` restated as fixed hex, so the toggle does not repaint the globe. The docs test's hex-literal check only reads `.css`, so nothing catches it. Fixing it means reading the resolved custom properties at runtime and re-reading them when `data-theme` changes.
- **`buildContentfulImageUrl` is exported so `imagePlaceholder` can bypass the CDN switch.** That bypass is correct (a `/cdn-cgi/image` path cannot be fetched at build time) but the interface says nothing about it, so a second caller would ship Contentful URLs from a Cloudflare build. Naming it for the intent, something like `getOriginImageUrl`, costs nothing and states why the hole exists.
- **The three `ArticleSlider` placements repeat the same responsive ramp**, differing only in the final `--slides-per-view`. A default in `slider.css` plus one override per placement would say the same thing in three lines instead of thirty.

## Waiting on the platform

- Replace the footer's and About's border dividers with CSS gap decorations (`row-rule`) once it is supported.
- Replace `HeaderLink`'s current-page JavaScript check with [declarative route and navigation matching in CSS](https://www.bram.us/2026/07/30/styling-the-navigation-declarative-route-and-navigation-matching-in-css/) once it is supported.
- Drop the hardcoded container-query breakpoints in favour of `ch` or another content-relative unit.
