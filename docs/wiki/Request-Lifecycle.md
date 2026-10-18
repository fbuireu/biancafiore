# Request Lifecycle

What happens between a visitor asking for a page and the page arriving: which layer answers, where the Workers cache sits, what a cache miss reads, and what the visitor gets when something on that path fails. The rendering decisions behind it are on [Rendering and Routing](Rendering-and-Routing); what clears the cache is on [Publishing](Publishing).

---

## A page request

Everything runs in one Cloudflare Worker, [`src/worker.ts`](https://github.com/fbuireu/biancafiore/blob/main/src/worker.ts): Astro's own request handler, which EmDash's Worker entry re-exports as it is, beside EmDash's scheduled handler and its plugin bridge. Three things stand in front of the code this repository writes, and most requests never get past the second:

```mermaid
---
config:
  look: handDrawn
  layout: dagre
---
sequenceDiagram
    participant Browser
    participant Assets as Static assets
    participant Cache as Workers cache
    participant EmDashMW as EmDash middleware
    participant SiteMW as src/middleware.ts
    participant Page as Page and components
    participant Loader as Live collection loader
    participant Fetch as fetchEntries
    participant EmDash as EmDash query API
    participant DB as D1 and R2
    Browser->>Assets: GET /articles/a-slug
    alt a file the build emitted, the legal pages included
        Assets-->>Browser: the file, with the security headers from _headers
    else no such file
        Assets->>Cache: the Worker's route
        alt held, fresh or within the hour of stale-while-revalidate
            Cache-->>Browser: the stored page, and a stale one is refreshed through the Worker in the background
        else a miss
            Cache->>EmDashMW: run the Worker
            EmDashMW->>EmDashMW: runtime and D1 session, redirects, setup, auth from the SESSION KV, preview context
            alt a redirect matches the path
                EmDashMW-->>Browser: its 301 or 302
            else no redirect
                EmDashMW->>SiteMW: next
                SiteMW->>Page: next
                Page->>Loader: getLiveCollection or getLiveEntry, through core/utils/entries.ts
                Loader->>Fetch: one query per collection
                Fetch->>EmDash: getEmDashCollection, page by page until exhausted
                EmDash->>DB: SQL on D1, the nearest read replica
                DB-->>EmDash: rows
                EmDash-->>Fetch: published entries
                Fetch-->>Loader: raw entries
                Loader-->>Page: domain models, mapped by the DTOs
                Page-->>SiteMW: HTML
                SiteMW-->>EmDashMW: the security headers set, outside /_emdash/
                EmDashMW-->>Cache: the response, a 404 logged for the admin and opted out of the route cache
                Note over EmDashMW,Cache: Astro then writes the route's rule and tags as Cloudflare-CDN-Cache-Control and Cache-Tag, and a response without them leaves with no-store
                Cache-->>Browser: the page, stored under its tags, a 404 never
            end
        end
    end
```

1. **Static assets answer first.** Whatever the build put in `dist/client`, the scripts, the stylesheets, the fonts, `robots.txt`, `/.well-known/security.txt` and the two prerendered legal pages, is served by Cloudflare before the Worker runs, with the security headers the build wrote into `_headers`.
2. **The Workers cache answers next.** A content page is stored with a day's `max-age`, an hour of `stale-while-revalidate` and the nine content tags, so most visits end here, at the edge, without a line of the Worker running for them; in the hour after the day, the visitor still gets the stored page while the cache asks the Worker for a fresh one in the background. Because the cache answers before the Worker, a signed-in editor gets the same cached page as everyone else, without EmDash's toolbar.
3. **On a miss, EmDash's middleware runs before the site's.** The integration registers it ahead of [`src/middleware.ts`](https://github.com/fbuireu/biancafiore/blob/main/src/middleware.ts): it opens the D1 session (an anonymous read goes to the nearest replica), answers a path an editor redirected with its 301 or 302, reads the admin session from the `SESSION` KV, and opens the preview context a [draft preview](#a-draft-preview) needs. After the page has rendered, it records the path of any 404 for the admin's *Redirects* screen, so an editor can see which old links still arrive, and switches the route cache off for that response, so no 404 is ever stored.
4. **The site's middleware sets the security headers** on every response the Worker renders, and leaves anything under `/_emdash/` alone, because EmDash sets its own, stricter policy there. On `/_image` it also switches the route cache off for an answer that is not a 200, so a failed [image](#an-image) is never stored. On a `200` from a content route it answers `Cache-Control: max-age=60`, which Cloudflare ignores beside its own header and the browser obeys, so the page a hover prefetched is the page the click shows rather than a second download; a preview and an editor's render keep EmDash's `private, no-store`, which EmDash's middleware writes after this one returns.
5. **The page reads content through a live collection**, never through the CMS. `core/utils/entries.ts` is the one module that calls `getLiveCollection` and `getLiveEntry`; the collection's loader, in `src/application/entities`, calls `fetchEntries`, which walks every page of the query and hands the entries to the DTOs that map them into the domain. [Content Model](Content-Model) follows one entry along that path.
6. **The response leaves with its cache rule.** Once both middlewares have returned, Astro's Cloudflare cache provider writes the route's rule into `Cloudflare-CDN-Cache-Control` and the tags into `Cache-Tag`, and the cache stores the page under them until it expires or a [publish](Publishing) purges a tag it carries. Writing them last is what lets EmDash's middleware cancel them for a 404, a preview or a signed-in editor's render. A response that leaves with no rule at all, because no route rule covers it or because it was cancelled, gets `Cloudflare-CDN-Cache-Control: no-store` from the adapter, and the cache does not store it.

**There is no locale anywhere on this path.** The site has no i18n: one language, `en-GB`, which every date and every sort uses, no locale in a URL, no page that reads the visitor's `Accept-Language`, and an admin EmDash offers in English alone.

---

## The routes

| Route | Renders | Cache | Reads from EmDash |
|---|---|---|---|
| `/` | on request | content rule | the site's Author, the site settings, the Projects, the Testimonials, the head of the Blog |
| `/about` | on request | content rule | the Cities, the site's Author, the Blog |
| `/contact` | on request | none | the head of the Blog; the form posts to a server action, which writes to Turso ([Contact Form](Contact-Form)) |
| `/projects` | on request | content rule | the Projects |
| `/articles` | on request | content rule | every Article |
| `/articles/[...slug]` | on request | content rule; a preview answers `private, no-store` and is never stored | the Article whole, its hand-picked Related Articles, every Article for the inferred ones, and the preview the link names |
| `/tags` | on request | content rule | the Tag Index |
| `/tags/[slug]` | on request | content rule | the Tag or Author Tag, every Article |
| `/privacy-policy`, `/terms-and-conditions` | at build, served as assets | the assets' own | nothing: the chrome takes the settings' and the menus' defaults |
| `/rss.xml` | on request | content rule | every Article, the site settings |
| `/sitemap.xml` | on request | content rule | every Article, the Tag Index |
| `/sitemap-index.xml` | a redirect to `/sitemap.xml` | none | nothing |
| `/404` | on request, for every unknown path | none: `no-store`, like every 404 | the head of the Blog |
| `/500` | on request, after an unhandled error | none | nothing of its own |
| `/_emdash/admin`, `/_emdash/api/…` | by EmDash | `private, no-store` | what the admin edits |
| `/_emdash/api/media/file/…` | by EmDash | `public, max-age=0, must-revalidate` for an image | the file, from R2 |
| `/_image?href=…` | by EmDash's image endpoint | image rule, a 200 alone; the browser keeps a 200 for the same day | an EmDash media file from R2, resized by the `IMAGES` binding; an imported image from the assets |

The **content rule** is the one `CONTENT_CACHE` in [`src/const/contentCache.ts`](https://github.com/fbuireu/biancafiore/blob/main/src/const/contentCache.ts) holds for every route in `CONTENT_ROUTES`: a day's `max-age`, an hour of `stale-while-revalidate`, and the tags of every content collection, of the `tag` taxonomy, of the bylines, of the site settings and of the two menus. Every content route carries every tag, because a page reads more than it looks like it does (the Article page reads every Article to infer its Related Articles) and a missing tag is a page a day stale.

The **image rule** is `IMAGE_CACHE`, beside it, for `IMAGE_ROUTE`: the same day and hour, and no tag, because nothing EmDash purges names a media file. [An image](#an-image) says what that means for a file an editor replaces.

Every page the Worker renders also reads its **chrome**: the site settings, the `footer` menu and, unless `HIDE_CHROME` hides the header, the `header` menu. That is why `/500` reads EmDash although it shows no content, and why a route with no rule still needs the settings and menus to answer. A response with no rule is never stored, since the adapter answers it `no-store`, so `/contact`, `/500` and every 404 render on each request and always show the current menus and settings.

An unknown Article or Tag slug renders the 404 page in place (`Astro.rewrite("/404")`), so the visitor stays on the URL they asked for and gets the 404 status. An unknown path first passes EmDash's redirects, and when none matches it gets the same 404 page. No 404 is stored, whichever way it was reached: EmDash's redirect middleware switches the route cache off for every 404 it answers, so a path that starts to exist, a new Article's slug or a redirect an editor adds, works on the very next request.

---

## When the database is down

D1 unreachable, or EmDash unable to answer, is felt only on a cache miss:

```mermaid
---
config:
  look: handDrawn
  layout: dagre
---
flowchart TB
    request(["a request for a content page"]) --> held{"is the page in the Workers cache?"}
    held -- "yes, within its day or the hour after" --> served["served from the cache<br/>the visitor sees nothing wrong"]
    held -- "no, or expired" --> render["the Worker renders it"]
    render --> query["fetchEntries: EmDash cannot read D1"]
    query --> cmserror["CmsError, which the loader hands back as an error"]
    cmserror --> thrown["core/utils/entries.ts throws it"]
    thrown --> fivehundred["Astro renders 500.astro<br/>which logs Unhandled server error with a reference"]
    fivehundred --> chrome["BaseLayout reads the site settings,<br/>the footer reads its menu: EmDash again"]
    chrome --> bare["the 500 page fails as well<br/>Astro answers a bare 500 with an empty body"]
```

- **A page the cache holds keeps being served** for as long as its entry lives: a day from when it was rendered, plus the hour of `stale-while-revalidate` after that, during which the background refresh fails without the visitor seeing it. The legal pages and every static file are assets, and keep answering whatever happens to the database.
- **A miss answers 500.** The loader's query fails with a `CmsError`, `contentLoader` hands it back as the collection's error rather than a short list, and the reader in `core/utils/entries.ts` throws it, because a page that lost the CMS should fail rather than render a partial listing.
- **The 500 page itself depends on the CMS.** It renders inside `BaseLayout`, which reads the site settings, and the footer reads its menu, so with D1 down it fails the same way. Astro then retries it without the middleware, and when that fails too it answers a bare `500` with an empty body: the visitor gets the browser's own error screen, without the site's copy and without a reference. The log still carries the failure, because `500.astro` writes its line before the layout renders.
- **The admin is down with it**, since EmDash keeps its users, sessions and content in the same database.

The same 500 answers a request whose content is broken rather than unreachable: the DTOs refuse an Article whose publish date cannot be read, one no byline credits, or an image without a resolved file, and that refusal fails every page that reads the entry, the listings and `/404` included, until an editor fixes it in the admin. A database with no published Article credited to the site's own byline fails `/` and `/about` the same way, which is where a freshly created stage starts.

---

## The 500 page and its reference

When a request throws and the 500 page can render, the visitor reads *Reference: 500 · 1a2b3c4d*: eight hexadecimal characters `createErrorReference` draws for that request. `500.astro` logs the error in the same breath, as one line through `@infrastructure/logging/logger.ts`:

- `message` is *Unhandled server error*, at `level` `error`;
- `path` is the path the visitor asked for, without its query string;
- `reference` is the eight characters on the visitor's screen;
- `error` holds the error's message, name and stack.

Logs and traces leave the Worker through Cloudflare's export to Better Stack ([CI/CD](CI-CD) says how), so a visitor who quotes the reference is one query away from their line: filter on `reference`. The page prints the reference and never the error, because what failed is for the log and not for the visitor. A 500 page reached directly, with no error behind it, prints *Reference: 500* alone and logs nothing.

---

## An image

Every image an editor uploads lives in R2, in the stage's `MEDIA` bucket, and EmDash records its dimensions and a blurhash in D1. A page never links the bucket: it links Astro's `/_image` endpoint, on the site's own origin, which EmDash answers by reading the file from the bucket and resizing it with the Cloudflare Images binding, on every stage ([ADR 0024](https://github.com/fbuireu/biancafiore/blob/main/docs/adr/0024-images-render-through-emdashs-endpoint-and-the-images-binding.md)).

```mermaid
---
config:
  look: handDrawn
  layout: dagre
---
flowchart TB
    render(["a page renders on a cache miss"]) --> resolve["resolveMedia in the CMS client<br/>storage key to /_emdash/api/media/file/key"]
    resolve --> create["createImage in the DTO<br/>the path, its dimensions, the blurhash bitmap"]
    create --> component["BlurImage or ArticleImage<br/>Astro's Image, given absoluteUrl of the path"]
    component --> html["src, srcset and sizes written by Astro<br/>/_image?href=...&w=...&h=...&f=webp"]
    html --> browser(["the browser asks for the width it needs"])
    browser --> held{"is that rendition in the Workers cache?"}
    held -- "yes, within its day or the hour after" --> stored["the stored rendition<br/>no Worker, no R2 read, no transform"]
    held -- "no, or expired" --> endpoint["EmDash's image endpoint at /_image<br/>matches the media path, never fetches the host"]
    endpoint -- "an EmDash media path" --> read[("reads the file from MEDIA, the R2 bucket")]
    read -- "the browser's ETag still matches" --> notModified["304, no transform, never stored"]
    read -- "a width this location holds no rendition of" --> binding["the IMAGES binding resizes it<br/>webp at quality 85"]
    binding --> answer["a 200, stored for a day under the image rule<br/>the browser keeps it a day"]
    endpoint -- "anything else, an imported image" --> stock["the adapter's endpoint<br/>reads ASSETS, resizes with IMAGES"]
```

- **The URL is a path, made once.** `resolveMedia` in [`src/infrastructure/cms/media.ts`](https://github.com/fbuireu/biancafiore/blob/main/src/infrastructure/cms/media.ts) turns EmDash's storage key into a path on the media route before any mapper sees it, and nothing but `absoluteUrl` turns that path into a full URL, where an Open Graph tag, a JSON-LD document or Astro's image service needs one.
- **Astro writes the image URLs, and nothing here does.** `BlurImage` and `ArticleImage` hand Astro's `<Image>` the media path made absolute, and the Article page asks `getImage` for its structured-data image the same way (`shareImage`). Astro writes the `src`, the `srcset` and the `sizes` as `/_image?href=…` URLs, because the adapter runs with `imageService: "cloudflare-binding"` and `astro.config.ts` authorizes `SITE_URL`'s host under the media path: Astro transforms only an absolute source a remote pattern allows, and passes anything else through as it is. A `constrained` image's `srcset` reaches twice the width it is given, since Astro cannot know a remote image's size; the Article's featured image and the Article card name their own widths and `sizes` instead.
- **EmDash's endpoint answers `/_image`, the same on every stage.** EmDash's integration installs it over the adapter's: for a path under the media route it reads the file through the `MEDIA` binding and resizes it with the `IMAGES` binding, to WebP at quality 85 unless asked otherwise, and it hands any other image, such as the imported portrait, to the adapter's endpoint, which reads it from the Worker's assets. It matches the path and never fetches the host in the `href`, so a preview on its own `workers.dev` address, behind Access, resizes from the bucket it is bound to, and `pnpm dev` resizes through Miniflare's local binding.
- **The Workers cache stores each rendition for a day.** The image rule reaches `/_image` as the content rule reaches a page, since Astro matches route rules against the path, and travels as `Cloudflare-CDN-Cache-Control`, which the cache reads and strips, so the site's middleware answers a `200` with `max-age=86400` for the browser: EmDash's own `public, max-age=0, must-revalidate` had every navigation ask again for every image the previous page had shown. A new visitor gets a stored rendition without the Worker running; the first request for a width in each location reads R2 and costs a transform, billed per unique transformation. EmDash's middleware writes no D1 bookmark cookie on this route, because a response that sets a cookie is never stored.
- **A replaced image can take a day to show.** Replacing a file in the media library keeps its storage key and purges nothing, so a rendition the cache holds keeps answering until its day, and the hour of `stale-while-revalidate` after it, run out, and a browser that already showed it keeps it for its own day. An upload is a new file under a new key, and saving the entry that picks it purges the pages that show it, so a new image appears on the next request ([Publishing](Publishing)).
- **Only a 200 is stored.** EmDash's redirect middleware, which keeps every page's 404 out of the route cache, skips `/_image`, so the site's middleware switches the route cache off for any image answer that is not a 200: a transform the binding refused, a file that is gone or a `304` leaves with `no-store`, and the next request tries again.
- **Some images go out as they are.** Astro needs both dimensions to transform a remote source, so an image whose block carries none, a split block's among them, is served from the media route untransformed, as EmDash's own components serve it. The endpoint reads only a width, a height, a format and a quality, and cannot crop, so the Article's structured-data image is one rendition at the image's own ratio, 1200 pixels wide or narrower, and Open Graph and Twitter point at the original file with its true dimensions.
- **The media route serves R2 under EmDash's own headers.** An image answers `public, max-age=0, must-revalidate` with validators, so a browser revalidates instead of downloading again, and a sandboxing content security policy; a type that is not a plain image is served as a download. The site's middleware leaves the route alone, as it does everything under `/_emdash/`.
- **The blur costs nothing.** EmDash computes a blurhash on upload, and `createImage` decodes it into a small inline bitmap the `BlurImage` component shows behind the image until it arrives. A format EmDash computes no blurhash for, AVIF among them, renders unblurred.

---

## A draft preview

An editor checks a draft before publishing it from a preview link EmDash issues in the admin: the Article's own URL with a signed `_preview` token. Only Articles have one.

```mermaid
---
config:
  look: handDrawn
  layout: dagre
---
sequenceDiagram
    participant Editor
    participant Cache as Workers cache
    participant EmDashMW as EmDash middleware
    participant Page as Article page
    participant Loader as article loader
    participant EmDash as EmDash query API
    Editor->>Cache: GET /articles/a-slug?_preview=token
    Cache->>EmDashMW: a miss, since no page is stored under that URL
    EmDashMW->>EmDashMW: verify the token, open a preview context naming the entry
    EmDashMW->>Page: next, with the route cache switched off for this request
    Page->>Loader: readArticle(slug)
    Loader->>EmDash: the published Articles, the draft laid over a published one
    alt no published Article carries the slug
        Loader->>EmDash: fetchEntry by slug, which the preview context answers with the draft
    end
    Loader->>EmDash: fetchPreview, which entry the verified token names
    Loader-->>Page: the Article, isPreview when it is that entry
    Page-->>EmDashMW: the page with PreviewBanner
    EmDashMW-->>Editor: Cache-Control private, no-store
```

- **A preview is never stored.** EmDash's middleware switches the route cache off for any request carrying a `_preview` token, valid or not, and answers a valid one `private, no-store`, so a draft cannot leak to a visitor through the cache or outlive its token there.
- **Drafts are for the preview context alone.** Every other query asks for published entries, whoever is signed in; inside a preview, a collection query lays a draft over an Article already published, and the page asks for the single entry by its slug when no published Article carries it, which is how a never-published Article previews at all.
- **The banner cannot be raised by hand.** The page shows `PreviewBanner` only when the entry the verified token names is the Article on the page; a forged or foreign token names nothing, so the visitor gets the published Article, or the 404 page, with no banner.

Publishing the draft is the next step, and it is on [Publishing](Publishing).
