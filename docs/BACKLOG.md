# Backlog

Ideas not yet scheduled, and the known defects not yet fixed. Items are removed when they ship or when they are decided against; an item that turns into a real decision becomes an ADR instead.

## Open decisions

- **Do Projects become sluggable content with pages of their own?** [ADR 0010](./adr/0010-projects-as-first-class-content.md) is Proposed and blocked on a glossary question: what distinguishes a Project from an Article once it has a slug, a body and a page. Until [`GLOSSARY.md`](../GLOSSARY.md) answers that, a Project stays a fragment on `/projects` and has no canonical URL of its own.

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

- **The two arrow boxes that reveal on hover have drifted apart.** `article-card.css` hides its arrow at `translate: -7px 0` and runs the fade and the slide over `0.35s`, the slide on `cubic-bezier(0.2, 0.7, 0.2, 1)`, while `_404.css` hides its own at `-6px 0` and runs both over `0.3s` with `ease`. One shared box would end the drift, and which numbers win is a visual call that no rule here makes.

## Known, deferred with a reason

- **The e2e suite covers almost nothing on a preview.** Every contact spec skips itself under `HIDE_CHROME`, and the theme-toggle spec survives only because the footer renders on the placeholder. [`e2e/client-router-rewiring.spec.ts`](../e2e/client-router-rewiring.spec.ts) covers the wiring a second pageview can break, and runs entirely inside `PUBLISHED_ROUTES` so `HIDE_CHROME` can never skip it, but everything a reader does on `/`, `/about`, `/contact` and `/projects` is unreachable there. The gap closes when `HIDE_CHROME` stops being `true` on the `development` environment, which is a settings change rather than a change here.

## Known breaches of the coding standards

Each line names where the tree breaks a rule of [`CODING_STANDARDS.md`](../CODING_STANDARDS.md) and the fix that closes it. None is known.

## Waiting on the platform

- Replace the footer's and About's border dividers with CSS gap decorations (`row-rule`) once it is supported.
- Replace `HeaderLink`'s current-page JavaScript check with [declarative route and navigation matching in CSS](https://www.bram.us/2026/07/30/styling-the-navigation-declarative-route-and-navigation-matching-in-css/) once it is supported.
- Drop the hardcoded container-query breakpoints in favour of `ch` or another content-relative unit.
