# Rendering and Routing

The site is configured as `output: "server"` on the Cloudflare adapter, and then almost none of it is rendered on request. Every content page opts into prerendering with `export const prerender = true`, so the site ships as HTML served from the edge and the SSR runtime is invoked only for genuinely dynamic paths: the contact server action, and the on-demand 404 and 500. [ADR 0011](https://github.com/fbuireu/biancafiore/blob/main/docs/adr/0011-hybrid-rendering-prerender-content-ssr-dynamic.md) records the trade; [ADR 0001](https://github.com/fbuireu/biancafiore/blob/main/docs/adr/0001-astro-ssr-on-cloudflare-workers.md) records the host and the constraints it imposes.

A test asserts `prerender` on every page the ADR says ships as static HTML, so a route cannot quietly start costing a request.

---

## The routes

| Route | What it serves |
|---|---|
| `/` | Home: the Featured Article, the Blog listing, Projects, Testimonials |
| `/about` | The Author's biography, and the Cities globe |
| `/contact` | The contact form, backed by a server action |
| `/projects` | The portfolio |
| `/articles` | The Blog index |
| `/articles/[...slug]` | An Article |
| `/tags` | The Tag Index, A to Z |
| `/tags/[slug]` | A Tag, or an Author Tag |
| `/privacy-policy`, `/terms-and-conditions` | Legal |
| `/rss.xml` | The feed, re-sorted by publish date rather than by the Author's preference |
| `/404`, `/500` | Errors |

**One module spells a content URL.** A route table turns a Slug into a path, and one helper folds in the origin: it is the tree's only reader of the site URL, so a canonical URL and a JSON-LD URL cannot disagree about where the site lives. Nothing concatenates a route constant with a slug.

---

## The middleware

Every response gets the security header set from one middleware. One directive is stripped in development, deliberately: the CSP carries `upgrade-insecure-requests`, and WebKit obeys it on `localhost`, rewriting every module script, font and dev-client request to `https://localhost:4321`, which the dev server does not speak. The page then renders inert with no JavaScript at all. Chromium exempts localhost, so this is invisible there and shows only in Safari and Playwright's `webkit` project. Production keeps the directive.

---

## HIDE_CHROME

A public boolean env var that does considerably more than its name suggests, which is why no component reads it directly: one module owns it and callers ask that module whether the header shows, whether breadcrumbs show, whether a table of contents shows, and whether the route serves real content.

It hides the header, the breadcrumbs on every page carrying them, and an Article's table of contents. It also **replaces the page body** with an under-construction placeholder on every route outside the articles, tags, legal and error allowlist, so `/`, `/about`, `/contact` and `/projects` serve no real content at all. The footer renders either way.

It is `true` in the `development` environment, which is what makes the per-PR preview an unfaithful target: the end-to-end suite that runs there sees the placeholder on four routes, and the contact specs skip themselves entirely. [ADR 0018](https://github.com/fbuireu/biancafiore/blob/main/docs/adr/0018-hide-chrome-replaces-the-page.md) records why the flag exists and what publishing a route means.

---

## Images

The image service switches by environment: Cloudflare's in a production build, Contentful or passthrough otherwise. One consequence is worth knowing, because it is the reason a helper is exported at all: a `/cdn-cgi/image` path cannot be fetched at build time, so the blur-up placeholder generator bypasses the switch and reads the origin URL directly.
