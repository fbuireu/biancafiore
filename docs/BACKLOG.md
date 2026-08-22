# Backlog

Ideas not yet scheduled. This list used to live as a block of `// todo:` comments in `src/pages/index.astro`, which the *No code comments* convention rules out and which no reader of that page would look for. Items are removed when they ship or when they are decided against; an item that turns into a real decision becomes an ADR instead.

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

## Waiting on the platform

- Replace the footer's and About's border dividers with CSS gap decorations (`row-rule`) once it is supported.
- Replace `HeaderLink`'s current-page JavaScript check with [declarative route and navigation matching in CSS](https://www.bram.us/2026/07/30/styling-the-navigation-declarative-route-and-navigation-matching-in-css/) once it is supported.
- Drop the hardcoded container-query breakpoints in favour of `ch` or another content-relative unit.
