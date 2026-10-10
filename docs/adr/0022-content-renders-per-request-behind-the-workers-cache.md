# 22. Content renders per request, behind the Workers cache

Date: 2026-10-04

## Status

Accepted. Supersedes [ADR 0011](./0011-hybrid-rendering-prerender-content-ssr-dynamic.md).

## Context

[ADR 0011](./0011-hybrid-rendering-prerender-content-ssr-dynamic.md) prerendered every content page because the content lived in Contentful and changed only when a build fetched it. With EmDash integrated into the site ([ADR 0021](./0021-emdash-self-hosted-cms.md)) the content lives in the Worker's own D1 database, which a build cannot read: the build runs against a local, empty one. A prerendered page would carry no content at all.

EmDash's answer is to render per request and let a cache absorb the cost: its query helpers hand back cache tags, and every write it makes purges the tags it touched.

## Decision

Content pages render per request. Only the two legal pages, which read no content, keep `export const prerender = true`.

Pages read through Astro live collections (`src/live.config.ts`), whose loaders in `src/application/entities` call `fetchEntries`. The response is cached by the Workers cache through Astro's Cloudflare cache provider (`cache.provider: cacheCloudflare()`), and `routeRules` in `astro.config.ts` give every content route, from `src/const/contentCache.ts`, one rule: a day's `max-age`, an hour of `stale-while-revalidate`, and the tags of every content collection and of the `tag` taxonomy. EmDash purges by those tags on every publish, so the long lifetime never serves a stale page past a change.

Every content route carries every content tag, rather than the tags of what it reads. A page here reads more than it seems to (the Article page reads every Article to infer its Related Articles, the tag pages read every Article), and a missing tag is a page that stays stale for a day with nothing to show for it. Purging the whole site on any publish costs a few cold renders on a site this size.

## Consequences

- **A cache miss reads D1.** A first request to a page in a given location runs a handful of queries and renders the Portable Text of every Article (the listings need each one's reading time), then the cache answers. Placing the Worker near the database would shorten the misses: EmDash's deployment guide recommends Targeted Placement (`placement.mode = "targeted"`) on the database's primary location, which is known only once wrangler has provisioned `biancafiore-content-production`.
- **Nothing is checked at build time any more.** A bad Article no longer fails a deploy: it fails the requests that render it, with a 500, until it is fixed in the admin. The `built` suite checks only what a build still emits.
- **The sitemap is a route.** `@astrojs/sitemap` lists what a build knows, which is now no Article and no Tag, so `/sitemap.xml` is rendered per request from the same collections; `/sitemap-index.xml` redirects to it. It shadows EmDash's own `/sitemap.xml`, which would list only collections with SEO enabled.
- **Images are no longer placeholders fetched at build.** The blur placeholder is decoded from the `blurhash` EmDash stores on upload, into an inline bitmap, with no request; a format EmDash computes no blurhash for renders unblurred.
- **An Article listed somewhere carries Related Articles inferred from its Tags.** Hand-picked ones are read only for the Article a page shows, the one place they are rendered.
- **The order the loader decided is the order a page gets.** Build-time collections answered in their store's key order, which is why production listed Articles alphabetically; a live collection answers in the loader's.
