# Rendering and Routing

The site is configured as `output: "server"` on the Cloudflare adapter, and every content page renders on request: the content lives in the Worker's own D1 database, which a build cannot read, so there is nothing to prerender. What keeps that cheap is the Workers cache in front of the Worker, which answers a page until EmDash purges it on a publish ([Publishing](Publishing) says what purges what); only the two legal pages, which read no content, still prerender. [ADR 0022](https://github.com/fbuireu/biancafiore/blob/main/docs/adr/0022-content-renders-per-request-behind-the-workers-cache.md) records the trade, which replaced the prerendering of [ADR 0011](https://github.com/fbuireu/biancafiore/blob/main/docs/adr/0011-hybrid-rendering-prerender-content-ssr-dynamic.md); [ADR 0001](https://github.com/fbuireu/biancafiore/blob/main/docs/adr/0001-astro-ssr-on-cloudflare-workers.md) records the host and the constraints it imposes.

The admin lives on the same origin, at `/_emdash/admin`, and EmDash's API under `/_emdash/api`; neither is ever cached.

---

## The routes

| Route | What it serves |
|---|---|
| `/` | Home: a welcome, the Projects, the Testimonials and the first Articles of the Blog |
| `/about` | The Author's biography, and the Cities globe |
| `/contact` | The contact form, backed by a server action |
| `/projects` | The portfolio |
| `/articles` | The Blog, led by the Featured Article |
| `/articles/[...slug]` | An Article |
| `/tags` | The Tag Index, A to Z |
| `/tags/[slug]` | A Tag, or an Author Tag |
| `/privacy-policy`, `/terms-and-conditions` | Legal |
| `/rss.xml` | The feed, re-sorted by publish date rather than by the Author's preference |
| `/sitemap.xml` | Every published page, rendered on request; `/sitemap-index.xml` redirects to it |
| `/404`, `/500` | Errors |

**One module spells a content URL.** A route table turns a Slug into a path, and one helper folds in the origin: it is the tree's only reader of the site URL, so a canonical URL and a JSON-LD URL cannot disagree about where the site lives. Nothing concatenates a route constant with a slug.

Which of these the cache holds, and what each one reads from the CMS, is the route table on [Request Lifecycle](Request-Lifecycle), beside the path a request takes to get there.

---

## One language

There is no i18n. The site is written in British English, and `en-GB` is the one locale: every date is printed in it, every sort collates in it, no route carries a locale segment, and nothing negotiates a language with the browser. EmDash's admin is configured with English alone. A second language would be a new decision, not a setting.

---

## The middleware

Every response the site itself serves carries the same security header set, built by one function: the middleware sets it on what the Worker renders, and a `_headers` file written at build time carries it for the prerendered pages. EmDash's routes under `/_emdash/` are the exception: the middleware returns their responses untouched, because EmDash sets its own policy there, stricter than the site's, and its media route adds a sandbox to every file it serves. One directive is stripped in development, deliberately: the CSP carries `upgrade-insecure-requests`, and WebKit obeys it on `localhost`, rewriting every module script, font and dev-client request to `https://localhost:4321`, which the dev server does not speak. The page then renders inert with no JavaScript at all. Chromium exempts localhost, so this is invisible there and shows only in Safari and Playwright's `webkit` project. Production keeps the directive. In production `script-src` names each inline script by its sha256 and carries no `'unsafe-inline'`: the digests are derived from the text the pages render, in the config for `_headers` and in the middleware for the rest, and every response carries the same set because a `ClientRouter` swap runs the incoming page's scripts under the policy of the page the reader landed on. `/.well-known/security.txt` is a static file the assets answer before the Worker runs, so the middleware never sees it: it carries the `_headers` set, and none of those headers changes its `text/plain` type.

---

## HIDE_CHROME

A public boolean env var that does considerably more than its name suggests, which is why no component reads it directly: one module owns it and callers ask that module whether the header shows, whether breadcrumbs show, and whether the route serves real content.

It hides the header and the breadcrumbs on every page carrying them; an Article's table of contents shows either way. It also **replaces the page body** with an under-construction placeholder on every route outside the articles, tags, legal and error allowlist, so `/`, `/about`, `/contact` and `/projects` serve no real content at all. The footer renders either way.

It is `true` in the `development` environment, which is what makes the per-PR preview an unfaithful target: the end-to-end suite that runs there sees the placeholder on the unpublished routes, and the contact specs skip themselves entirely. [ADR 0018](https://github.com/fbuireu/biancafiore/blob/main/docs/adr/0018-hide-chrome-replaces-the-page.md) records why the flag exists and what publishing a route means.

---

## Images

Every image an editor uploads is stored in R2 and served by EmDash's media route, `/_emdash/api/media/file/…`, on the site's own origin. Every image a page shows switches by environment: in a production build its `src` and `srcset` point at Cloudflare's `/cdn-cgi/image` in front of that route, which resizes it and converts it to a format the browser accepts, and everywhere else at the original file, since a preview on `workers.dev` or `localhost` sits on no zone that could transform it. Those URLs are built once, in the application layer, because Astro's own image service passes a path on the site's origin through untransformed. The blur-up placeholder costs nothing either way: it is decoded from the blurhash EmDash stores for every upload. [Request Lifecycle](Request-Lifecycle#an-image) draws the whole path.
