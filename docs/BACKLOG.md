# Backlog

Ideas not yet scheduled, and the known defects not yet fixed. Items are removed when they ship or when they are decided against; an item that turns into a real decision becomes an ADR instead.

## Open decisions

- **Do Projects become sluggable content with pages of their own?** [ADR 0010](./adr/0010-projects-as-first-class-content.md) is Proposed and blocked on a glossary question: what distinguishes a Project from an Article once it has a slug, a body and a page. Until [`CONTEXT.md`](../CONTEXT.md) answers that, a Project stays a fragment on `/projects` and has no canonical URL of its own.
- **Does the wrangler deploy-message truncation deserve an ADR?** It is a bullet in the Deploy section of [`AGENTS.md`](../AGENTS.md) and a paragraph of the CI/CD wiki page today, and the docs test holds the `--message` flag; it constrains CI permanently: the annotation is passed explicitly so nothing about how a commit is written can reach it.

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

- **The stretch-arrow hover morph is written over and over.** `global.css` (`.editorial-cta`), `slider.css` (`.slider__btn`), `link-with-arrow.css`, `scroll-top.css`, `article-card.css`, `world-globe.css` and `_404.css` each set `d: var(--stretch-arrow-shaft-hover)` and `d: var(--stretch-arrow-tip-hover)` on hover. All but one would collapse into one `@layer modifiers` block mixed in as a class on the hovering element, the way `underline-on-hover` already is. The exception, `article-card`, is triggered by a sibling selector (`.article-card__link:is(:hover, :focus-visible) ~ .article-card__item`) rather than by the element's own `:hover`, so one mix cannot express it; deciding what to do about that case is what this is waiting on. The surrounding arrow boxes have already drifted (`translate: -7px 0` vs `-6px 0`, `0.35s` vs `0.3s`).
- **The globe does not follow the theme.** `about/components/worldGlobe/const.ts` hardcodes `#d4a259`, `#f7ecd6` and `#FFFFFF00`, colours of no token family (`--gold` and `--surface` are other `light-dark()` pairs), so the toggle does not repaint the globe. It is the one file `HEX_COLOURS_AWAITING_A_TOKEN` exempts from the docs test's hex check. Fixing it means reading the resolved custom properties at runtime and re-reading them when `data-theme` changes, then emptying that allowlist.
- **`buildContentfulImageUrl` is exported so its callers can bypass the CDN switch.** `imagePlaceholder` needs the origin URL because a `/cdn-cgi/image` path cannot be fetched at build time, and `createImage` builds its share crops from it; the name says neither. Naming it for the intent, something like `getOriginImageUrl`, costs nothing and states why the hole exists.
- **The `ArticleSlider` placements repeat much of the same responsive ramp**, differing in the final `--slides-per-view` and, on About, a missing 720px step. A default in `slider.css` plus one override per placement would say the same thing in a fraction of the CSS.

## Known, deferred with a reason

- **React ships site-wide for a cookie banner.** `CookieConsent` is `client:only="react"` in `Footer.astro`, which `BaseLayout` renders unconditionally, so `react-dom` (184 KB) is on every article page for a banner whose library, `vanilla-cookieconsent`, is framework-free by design. Rewriting it as an Astro component with a bundled script would take that 184 KB off the critical path of the site's core deliverable. It is deferred because the banner is the one place a mistake is a legal problem.
- **GSAP is a static import in the header.** 69.6 KB downloads on first paint of every page for an animation the reader may never trigger. A dynamic `import("gsap")` inside the click handler costs one `await`.
- **The default OG image is a 953 KB JPEG.** `seo/const.ts` uses `biancaImage.src`, which forces the original into the output as the `og:image` for every page that does not override. A card wants roughly 1200x630.
- **The e2e suite covers almost nothing on a preview.** Every contact spec skips itself under `HIDE_CHROME`, and the theme-toggle spec survives only because the footer renders on the placeholder. [`e2e/client-router-rewiring.spec.ts`](../e2e/client-router-rewiring.spec.ts) covers the wiring a second pageview can break, and runs entirely inside `PUBLISHED_ROUTES` so `HIDE_CHROME` can never skip it, but everything a reader does on `/`, `/about`, `/contact` and `/projects` is unreachable there. The gap closes when `HIDE_CHROME` stops being `true` on the `development` environment, which is a settings change rather than a change here.
- **A heading anchor is not deduplicated.** Two `## Conclusion` headings in one Article produce two `id="conclusion"` and two table-of-contents links that both jump to the first; a heading of only punctuation yields `id=""`. So does a heading in any non-Latin script: `slugify` strips everything outside `\w` after its NFD pass, which turns `Café` into `cafe` correctly and `Ελληνικά` and 日本語 into the empty string. Deferred rather than fixed because the site is English-only and multi-language is itself still a backlog item, so the transliteration question and this one want answering together.
- **A Tag whose name is empty gets its own A–Z bucket, headed by nothing.** `buildTagIndexBuckets` groups on `name.charAt(0).toUpperCase()`, which is `""` for an empty name, and `""` sorts before `A`, so the tag index would open with an unlabelled group. `tagSchema` types the name as a bare `z.string()`, so Contentful is the only thing stopping it. Left as a note rather than a guard because no reachable path in this tree produces it: the tag index drops any entry with no articles, and an entry with articles came from a Contentful Tag whose name is required. Recorded so the next reader knows the constant was counted rather than assumed.
- **The 500 page prints the error message in its body and its public meta description.** `500.astro` builds `For full transparency this is the error: ${reference}` from `error.message` and hands it to `Seo.astro`, which renders it as `<meta name="description">`, `og:description` and `twitter:description`. The page is `noindex, nofollow` and the copy calls the transparency intended, but it breaks the rule in `CODING_STANDARDS.md` that a visitor reads only the copy the page writes for them. The fix is to show a reference, the trace id, and leave the message to the Worker log. The response carries the full security header set, like any other the middleware wraps.
- **`script-src 'unsafe-inline'` is site-wide.** The reason is real, both ADR 0005 and ADR 0013 need a script before paint, and there are only two such tags, both rendered by `Head.astro` from a module. That makes a hash or a nonce reachable from one place whenever it is worth doing.

## Known breaches of the coding standards

Each line names where the tree breaks a rule of [`CODING_STANDARDS.md`](../CODING_STANDARDS.md) and the fix that closes it.

- **`AuthorDTO.latestArticle` is declared twice**, by hand in `@domain/author` and by the authors loader extending `authorSchema`: declare `authorEntrySchema = authorSchema.extend({ latestArticle: reference("articles").optional() })` in `@domain/author`, infer `AuthorDTO` from it and bind it in the loader.
- **A refused publish date or Period names the value, not the entry**, and `articleSlug` names nothing: add `articlePublishDateISO(rawArticle)` beside `articleSlug`, rethrowing with the slug and `{ cause }`, let `createCities` wrap `createPeriod` with the City's name, and add `sys.id` to the two `select` lists.
- **Six loaders repeat their Skeleton's `content_type` as a literal** that `tsc` does not tie to it: type the queries `fetchEntries` takes as `EntriesQueries<Skeleton, undefined>`, which types `content_type` as `Skeleton["contentTypeId"]`.
- **A raw Author's and Tag's slug and name are read in several helpers**, and `getTagSlugs` does not trim, so Related Articles can split two Tags the Tag Index merges: add `authorIdentity` beside `createAuthor`, `tagIdentity` under `dto/tag/utils` and `articleIsFavorite` beside `articleSlug`, and call them everywhere.
- **The Latest Article is chosen in `author/utils/articles.ts` with a comparator of its own**: take the head of `sortReverseChronological`.
- **`City.name`, `Project.id` and `Testimonial.quotee` key their collections untrimmed, and `createProjects` keeps an empty `id`**: trim the three keys and fall back to the slugified name when `id` is empty.
- **Exports with no importer**: `IMAGE_EMBED_LAYOUT`, `getImageEmbedWrapperClass` and `RenderedArticle` in `content.ts`, `ConsentStatus`, and `Zoom`, `ArticleShareLinks` and `ContactActionResult`: drop the `export`.
- **`toAbsoluteSrc` in `imageOptimization.ts` is a second, tolerant absolutiser beside `createImage`**: export one `absoluteAssetUrl` beside `createImage`, call it from the rich-text renderer too, and delete `toAbsoluteSrc` with its tests.
- **Six tests carry eight copies of the `Exit` extractors** (`failureOf`, `defectOf`, `failureTag`): move one helper into `src/tests/` in the same change as the six tests.
- **The contact notification prints its date in the runtime's time zone without saying which** (`createEmail`): pass `timeZone` and `timeZoneName`.
- **`featured-image-${slug}` is spelled in `[...slug].astro` and `ArticleCard.astro`**, and the view transition depends on the two agreeing: add `featuredImageTransitionName(slug)` beside `BlurImage`.
- **The unindexed routes are declared three times**: in `noindexRoutes.ts`, in two `PAGES_ROUTES` values and in each legal page's `robots`: let `PAGES_ROUTES` take them from `noindexRoutes.ts` and `Seo.astro` derive `robots.index` from `NOINDEX_ROUTES`.
- **`projects.astro` and the legal pages use classes outside a block** (`project-wrapper`, `project-image-wrapper`, `privacy-policy-wrapper`, `terms-and-conditions-wrapper`, `legal-page__email`): rename them `project-section__*` and a `legal-section` modifier, in the template and `project-section.css` / `legal-section.css` together.
- **`_tag.css` repeats the `page--tags` background of `_tags.css`**: one stylesheet both routes import.
- **`404.astro` rebuilds the head of the Blog**: call `blogTeaser`.
- **`FormStatus` lives in `@shared/ui/types.ts` with one reader**, `ContactForm.tsx`: move it to `@modules/contact`.
- **The `/projects` intro calls the work "case studies"**, a word the glossary retires for Project: rewrite it in the glossary's words.
- **`mail-to__button--address` is state only JavaScript reads, kept in a class**: move it to `data-shows="address"`, with `e2e/client-router-rewiring.spec.ts` in the same change.
- **Related Articles' `ItemList` keeps the stored order while `ArticleSlider.astro` shuffles the slides in its frontmatter**: shuffle once in a tested `relatedArticles/utils` module and hand the result to the slides and to `buildArticleListSchema`.
- **The "Fresh from the blog" slider has no glossary term**, so `LatestArticles`, `AboutLatestArticles`, `MAX_LATEST_ARTICLES` and `blogTeaser` borrow Latest Article and "teaser": give it a term in `CONTEXT.md` and rename after it.
- **Blocks not named after their component**: `site__logo`, `breadcrumb__item`, `navigation__menu*` in `menu`, `footer` as a type selector, `city-card`, `article__table-of-contents*`, `contact-tabs`/`contact-tab`, `testimonials__*`, `marker-wrapper`/`marker__label`: rename each with the stylesheets, tests, e2e specs and ADRs that name it.
- **Templates and their scripts repeat class and id literals** (`header/utils/interactions.ts`, `sliderShell/utils/slider.ts`, `themeToggle/utils/theme.ts`, `columnsToggle/utils/layout.ts`, `readingProgress/utils/progress.ts`, `contact/utils/tabs.ts`, `contact/utils/form.ts`, the Calendly class in `tabs.css`): a `const.ts` per component, and a test holding each stylesheet's spelling to it.
- **`Seo.astro` sets `og:locale` to `en_US` while `<html lang>` is `en-GB`**: derive it from `DEFAULT_LOCALE_STRING`.
- **`linkWithArrow` and `spinner` sit in `core` with one caller each**: move them into `articles` and `contact`.
- **`SliderShell` takes a `hasButtons` no caller sets to `false`**, and three selectors test `data-has-buttons`: drop the prop, the attribute and those selectors.
- **The placeholder in `BaseLayout.astro` styles itself inline with fixed sizes**: give it a block and tokens.
- **`initTabs` and `WorldGlobe`'s `width` take a value only their tests pass**: set `history.replaceState` and `innerWidth` in the tests instead.
- **`contact/utils/tabs.ts` and `contact/utils/form.ts` serve one component each from the feature's `utils/`**: move them under their component, with ADR 0014's link.
- **`myWork`/`MyWork` and `DISCIPLINES` use words the glossary retires for Project**: rename them after Project, with the styles guide census.
- **`WorldGlobeCanvas.test.tsx` answers a wildcard host without asserting what it recorded**: assert its `calls`.
- **Small HTML and typing slips**: `Textarea.tsx` extends `InputHTMLAttributes`, `FeaturedArticle.astro` puts an `<a>` straight inside a `<ul>`, the Table of Contents' `h5` skips levels after the `h1`, the "Archival notice" label differs from the visible "Archival note", `Recaptcha.tsx` renders an `<input hidden>` with no `name`, and `textarea.css` and `testimonials__slide` carry dead rules: fix each where it stands.
- **Without `animation-timeline`, the first Project's fixed image covers the others at 768px and up**: move `position: fixed`, `inset` and `height: 100dvh` into the same `@supports` block, with an in-flow two-column fallback.
- **`prefers-reduced-motion` does not stop the scroll-driven animations**, since the reset shortens durations a scroll timeline ignores: wrap each `@supports (animation-timeline: …)` block in `@media (prefers-reduced-motion: no-preference)`, as `.reveal-once` does.
- **View transitions ignore reduced motion, and `base.css` declares `navigation: auto` on `html, body` as a property**: add `@media (prefers-reduced-motion: reduce) { @view-transition { navigation: none; } }` and drop the declaration.
- **Rules one component uses sit in the global cascade**: 11 of the 14 `@keyframes` in `animations.css`, the two blocks of `vendor/overrides.css` and `.slider-wrapper--reveal-items` in `reveal.css`: move each into its component's stylesheet, as `toc-slide-in` already is.
- **The stretch arrow's path is declared three times**: in `svg/stretch-arrow.svg`, in `StretchArrow.tsx` and in the `--stretch-arrow-*-hover` tokens: keep one source and a test comparing the path commands.
- **`svg/chevron-down.svg` paints a fixed black**, which disappears on the dark theme: paint it through `mask-image` and `background-color: currentColor`.
- **`.justify-space-between` never applies at its one call site**: drop it from `LittleMoreOfMe.astro`, `global.css` and the census.
- **`Cities.astro` counts its cards into `data-num-cards`**, which `sibling-count()` gives: read `sibling-count()` and lay the rows out with `grid-auto-rows`.
- **`cookie-consent.css` uses a colour of no family, `slider.css` expresses variants through `data-has-*` rather than modifiers, and nothing reads the `zoom-in` and `zoom-out` ids**: fix each where it stands.
- **`commitlint.config.ts` imports types from `@commitlint/types`, which is not declared**, so `tsconfig.json` excludes the file: declare the devDependency and drop the exclude.
- **The site origin is written in `astro.config.ts` (`site`), in `SITE_URL` and in `built-output.test.ts`**, which compares the feed with a literal: compare it with the sitemap's `<loc>` and derive `site` from `SITE_URL`.
- **The e2e specs copy what they locate by**: `MENU_OPEN_CLASS`, `.contact-tab`, `.header__menu-button`, `.article-wrapper` and the slider button are literals, so a rename reaches an e2e run rather than `tsc` and can skip a case instead of failing it, and `e2e/contact-tabs.spec.ts` repeats its skip: import the component constants and share the skip.
- **An Article whose Related Articles do not overflow the track fails `e2e/client-router-rewiring.spec.ts` rather than skipping it**: skip when the track cannot scroll.
- **The release-config block of `docs/docs-consistency.test.ts` calls `plugins.find(…)` three times**, in a block the sibling repositories share: extract one helper in all three at once.

## Waiting on the platform

- Replace the footer's and About's border dividers with CSS gap decorations (`row-rule`) once it is supported.
- Replace `HeaderLink`'s current-page JavaScript check with [declarative route and navigation matching in CSS](https://www.bram.us/2026/07/30/styling-the-navigation-declarative-route-and-navigation-matching-in-css/) once it is supported.
- Drop the hardcoded container-query breakpoints in favour of `ch` or another content-relative unit.
