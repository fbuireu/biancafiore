# 25. Navigation is the browser's own, with cross-document view transitions

Date: 2026-10-18

## Status

Accepted.

## Context

The site rendered Astro's `ClientRouter` on every page. It intercepted every same-origin click, fetched the next page's HTML with `fetch()`, waited for the whole document and for every stylesheet it had not seen, asked the browser to capture the old page for a view transition, and only then swapped `<body>` in place. Until all of that was done the old page stayed frozen with no sign that the click had landed, and on a listing the capture alone was hundreds of milliseconds, since every card image was a named element the browser renders as a layer of its own. The fetch could not reuse the page the hover prefetch had just downloaded: a `<link rel=prefetch>` serves a later `fetch()` only when the response has a lifetime, and Astro closed the report of that (withastro/astro#17549) as not planned. A direct load of the same URL was fast, because the browser paints a document as it arrives.

The router also set the terms for every bundled script. A swap keeps `window`, `document` and `<html>`, so each script waited for `astro:page-load`, guarded what it added to those three against stacking, and repainted the incoming document on `astro:before-swap` (the theme, the Article's columns), and an inline script ran under the policy of the page the reader had landed on.

What the router gave the site, an animated morph between pages, the browser now does across documents: `@view-transition { navigation: auto }` in `base.css` already opted every page in, and it is in Chromium and Safari.

## Decision

**A navigation is the browser's own: no page renders the `ClientRouter`.**

- `Head.astro` renders no `<ClientRouter />`. A link is a plain navigation, and `@view-transition { navigation: auto }` in `base.css` animates it across documents, with `navigation: none` under `prefers-reduced-motion: reduce`.
- Astro's hover prefetch stays (`prefetch.prefetchAll`), and the minute of browser cache a content page carries ([ADR 0022](./0022-content-renders-per-request-behind-the-workers-cache.md)) is what lets the navigation take the page the prefetch downloaded, in every browser.
- A bundled `<script>` calls its initialiser as it loads. No module listens for an `astro:` event, since none fires without the router, and nothing repaints an incoming document.
- The featured image's view transition names one element per page. The Article route names its featured image through `BlurImage`'s `transitionName`; a card writes the same name into `data-transition-name`, and `FEATURED_IMAGE_TRANSITION_SCRIPT`, an inline script `Head.astro` renders, applies it on `pageswap` to the card that links where the reader goes and on `pagereveal`, after a traversal back, to the card that links to the Article the reader left. It is inline because `pagereveal` fires before the new page's first paint, which a bundled module can miss, so `inlineScriptHashes` names it in the policy.
- A content page is prerendered on a hover. `Head.astro` renders speculation rules, `SPECULATION_RULES`, that prerender with `moderate` eagerness a link to any route `CONTENT_ROUTES` names but the feeds, the pages the Workers cache answers, so a prerender costs the Worker no render and a click activates a page already painted. `/contact` is left out, since its reCAPTCHA and Calendly would load for a reader who never opens it. The rules are inline, so `inlineScriptHashes` names them in the policy.
- A prerendered page runs its scripts before the reader sees it, so nothing that reports a visit starts until it is shown. The consent bootstrap sets the consent default at once and configures Google Analytics and appends `gtag.js` and `gtm.js` only when `document.prerendering` is false or `prerenderingchange` fires ([ADR 0013](./0013-analytics-gated-behind-cookie-consent.md)), and `onceActivated` holds the Better Stack tag and the carbon badge back the same way. Cloudflare's beacon, which the zone injects at the edge, is outside this as it is outside ADR 0013.

The rejected alternative was to keep the `ClientRouter` and narrow what it costs: a lifetime on the page so its fetch reuses the prefetch, and a name on the clicked card alone. It measured the same as this decision on a local build, and it keeps a client-side router, its script lifecycle and its own copy of what the browser now does.

## Consequences

- **Firefox navigates without an animation.** It has no cross-document view transitions, and under the router it animated through Astro's fallback. Chromium and Safari 18.2 and later animate.
- **A navigation paints as the page arrives.** Nothing waits for the whole document or its stylesheets before the reader sees a change, which is why a direct load was always the fast path. In Chromium a hovered content page is already rendered, so the click only activates it; a browser without speculation rules ignores them and keeps the prefetch.
- **A hover can render a page the reader never opens.** It is a cache hit at the edge and the reader's own CPU, and it reports no visit, since every analytics script waits for activation. A script added to a page that calls a third party or counts something starts through `onceActivated`, or it runs for every hover. DevTools turns prerendering off, so a prerender is observed without it.
- **Every page is a fresh document.** An initialiser runs once per page and nothing it adds to `window` or `document` can stack, so no bundled script guards against a second navigation; a `data-` flag guards only an initialiser one page can run twice. The navigation spec holds the wiring across pages.
- **The inline script that names a card is load-bearing for the morph.** Dropping it leaves every card unnamed, so the featured image fades in instead of growing out of the card, and naming every card in markup brings back the capture cost and the cards hanging over the next page.
- **The theme bootstrap is the whole of the theme's first paint.** No `astro:before-swap` repaints a new document, so a change to `THEME_BOOTSTRAP_SCRIPT` that stops it painting shows on every navigation, not only on the first load.
