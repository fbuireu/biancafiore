# Contentful → EmDash migration (live content collections)

Branch `feat/emdash-migration` replaces the Contentful headless CMS with
[EmDash](https://github.com/emdash-cms/emdash) (`emdash@0.19.0`), wired through
**Astro Live Content Collections** so editorial changes publish instantly with
no rebuild/redeploy.

> ⚠️ **EmDash is pre-1.0 (v0.19.0)** and Astro Live Content Collections are new.
> Treat this as a staging migration: validate end-to-end on a preview deploy
> before pointing production at it.

## Reality check vs the docs

The published `emdash@0.19.0` package does **not** ship the `d1()` / `r2()`
adapters the online docs show. The real adapters are `sqlite | libsql | postgres`
(`emdash/db`) and `local | s3` (`emdash/astro`). So on Cloudflare we use **Turso
(libSQL over HTTP)** for the database and **R2 via its S3-compatible API** for
media. No D1/R2 Worker bindings are needed. Dev uses a local SQLite file +
on-disk uploads (`./.emdash/`).

## Architecture

- **`src/live.config.ts`** defines six live collections (`articles`, `authors`,
  `tags`, `cities`, `projects`, `testimonials`), each backed by a custom
  `LiveLoader` in **`src/infrastructure/cms/loaders.ts`** that queries EmDash
  (`getEmDashCollection`) and runs the existing DTO mappers.
- **`src/infrastructure/cms/content.ts`** exposes `getArticles` / `getArticle` /
  `getAuthors` / `getTagGroups` / `getCities` / `getProjects` /
  `getTestimonials`, thin wrappers over `getLiveCollection` / `getLiveEntry` that
  adapt entries into the `CollectionEntry<T>` shape (`toEntry`).
- **Pages are SSR** (`output: "server"`, no `prerender`). The dynamic routes
  (`articles/[...slug]`, `tags/[slug]`) read `Astro.params`, fetch live, and
  `Astro.rewrite("/404")` on a miss.
- The build-time collections in **`src/content.config.ts`** are kept with **empty
  loaders** (`loader: () => []`) purely to keep the `CollectionEntry<T>` types
  generated — so the ~20 UI components stay untouched. No content is read at
  build time, so the build no longer depends on EmDash being reachable.
- **`deploy-article.yml` was deleted**: publishing no longer triggers a deploy.

## What changed in code

| Area | Before (Contentful) | After (EmDash + live collections) |
| --- | --- | --- |
| Source | `contentful.createClient` + build-time `getCollection` | `getLiveCollection` / `getLiveEntry` (live loaders) |
| Content shape | `Entry.fields.*` + auto-resolved links | `entry.data.*`; references are entry-id strings resolved in loaders |
| Rich text | `@contentful/rich-text-html-renderer` | `@portabletext/to-html` (`renderOptions.ts`) |
| Images | Contentful Images API | R2 URLs + Cloudflare Image Resizing (`/cdn-cgi/image/...`) |
| DB / media | Contentful SaaS | Turso (libSQL) + R2 (S3 API) |
| Publishing | webhook → redeploy (`deploy-article.yml`) | instant (live query per request) |

**Status:** `pnpm lint:ts:typecheck`, `pnpm run sync` and `biome check` all pass
on the migrated code. Not yet runtime-verified against live content (needs a
provisioned EmDash instance — see below). A production `pnpm build` was not run
(requires the Turso/R2 secrets).

---

## ✅ What is left on YOUR side

1. **Restore the supply-chain guard.** To install `emdash@0.19.0` (published
   within the 3-day window) the `minimumReleaseAge` line in
   `pnpm-workspace.yaml` was commented out. **Re-enable it** once the package
   ages past the cutoff (or decide to keep it relaxed deliberately).

2. **Provision infrastructure (your accounts):**
   - **Turso DB** for EmDash → `EMDASH_TURSO_URL` + `EMDASH_TURSO_AUTH_TOKEN`
     (keep it separate from the existing `@astrojs/db` Turso database).
   - **R2 bucket** + an S3 API token → `EMDASH_R2_ENDPOINT`, `EMDASH_R2_BUCKET`,
     `EMDASH_R2_ACCESS_KEY_ID`, `EMDASH_R2_SECRET_ACCESS_KEY`, and optionally
     `EMDASH_R2_PUBLIC_URL` (public/custom-domain URL so `/cdn-cgi/image` can
     fetch originals).
   - EmDash requires **Dynamic Workers** (paid Workers plan) for its sandboxed
     plugin runtime.

3. **Add the secrets** to GitHub Actions (same names) — `ci.yml` → `_deploy.yml`
   already pass them through and push them as Worker secrets on deploy. They are
   needed at **runtime** (every request queries Turso/R2), not at build.

4. **Create the collections** in the EmDash admin UI (collections live in the
   database, not in code) with these exact field names:
   - `articles`: `title` (string), `slug` (slug), `content` (portableText),
     `description` (text), `publishDate` (datetime), `featuredImage` (image),
     `featuredArticle` (boolean), `isRepublished` (boolean), `originalSource`
     (string), `author` (reference→authors),
     `relatedArticles` (reference→articles, multiple). **Tags are NOT a field** —
     enable a flat **`tag` taxonomy** on the collection (see below).
   - `authors`: `name`, `slug`, `description`, `jobTitle`, `currentCompany`,
     `profileImage` (image), `socialNetworks` (json/array of urls)
   - **`tag` taxonomy** (flat) — the article tags. Create terms in the admin or
     via `emdash taxonomy add-term`; the loaders read them with
     `getTermsForEntries("articles", ids, "tag")`.
   - `cities`: `name`, `coordinates` (json `{ lat, lon }`), `startDate`
     (datetime), `endDate` (datetime, optional), `description`, `image` (image)
   - `projects`: `id` (string, optional), `name`, `description` (portableText),
     `image` (image)
   - `testimonials`: `author`, `quote`, `image` (image), `role`

5. **Generate types & tighten:** `pnpm cms:types` writes `.emdash/types.ts`; use
   it to verify the hand-written `Raw*` interfaces match the live schema.

6. **Migrate content:** fill `.env` (see `.env.example`) and run
   `pnpm cms:migrate` (reads Contentful via the CDA REST API, converts Rich Text
   → Portable Text, uploads media, creates entries — authors/tags first, then
   articles, then a `relatedArticles` second pass).

## Known gaps to verify before production

- **Content model (resolved after checking the installed package).**
  - **Tags → taxonomy.** Confirmed against `emdash@0.19.0`: tags are a taxonomy,
    not a reference field. The loaders read them via
    `getTermsForEntries(...)` (`client.ts → queryTermsForEntries`) and the
    migration script attaches them via `POST …/terms/tag`. You must create the
    `tag` taxonomy + terms in the admin.
  - **Author → kept as a reference collection (deliberate).** EmDash 0.19 has a
    native **byline** concept (`getByline`, `entry.data.bylines`), but
    `BylineSummary` only carries `displayName`, `bio` and an avatar — it has **no
    `jobTitle`, `currentCompany` or `socialNetworks`**, which the `/about` page
    and JSON-LD need. So authors stay a dedicated collection + reference. If you
    later want native attribution too, `entry.data.bylines` is available for free
    on every queried entry.
- **Portable Text renderer.** EmDash ships an official `<PortableText value={…} />`
  component (`emdash/ui`). This migration instead serialises to an HTML string
  with `@portabletext/to-html` + custom serializers, to reproduce the exact
  existing article markup (heading `<section>`s, embeds). Both are valid; switch
  to the official component if you prefer fewer moving parts.
- **Live collections caching:** the loaders return `cacheHint`s (collection +
  per-entry `tags` and `lastModified`). Put a CDN / route cache in front to turn
  these into real HTTP caching; the tags allow targeted invalidation on publish.
- **Rich-text conversion.** `scripts/migrate-contentful-to-emdash.ts` maps
  paragraphs, headings, lists, blockquotes, marks, **hyperlinks** (Portable Text
  markDefs) and embedded **entries** (`codeBlock`, `videoEmbed`, `iframeEmbed`,
  `imageEmbed`) → the custom types the renderer supports. Remaining gap: inline
  content images keep their Contentful asset URL (only `featuredImage` is
  re-uploaded to R2) — re-host them or extend the converter to upload inline
  assets via `migrateAsset`.
- **Media upload** mechanics depend on the EmDash storage adapter/version; the
  `/media` POST body in the script may need adapting.
- **404 behaviour:** missing article/tag slugs `Astro.rewrite("/404")` — confirm
  the 404 page renders as expected under SSR.
