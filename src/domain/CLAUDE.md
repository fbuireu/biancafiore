# src/domain

The pure domain layer. One folder per domain concept, named in the singular after the term in [CONTEXT.md](../../CONTEXT.md) (`article`, `author`, `city`, `project`, `tag`, `testimonial`, `breadcrumb`, `contact`). See ADR 0012.

## Anatomy of a concept

```
<concept>/
  schema.ts   # astro/zod schema: what validates at the edge (a content collection, or the action input for contact)
  types.ts    # DTO type + concept-specific types (e.g. ArticleType, ArticleHeading)
  rules.ts    # pure functions encoding editorial rules
  index.ts    # barrel: export * from each of the above
```

Not every concept needs all three. `rules.ts` is the exception rather than the norm: it exists for `article`, `breadcrumb`, `city`, `contact`, `tag` and no one else; `contact` carries a schema and the one rule that decides when two addresses are the same person, `breadcrumb` is rules + types, and the rest are schema + types. Add a file when there is something to put in it.

## Hard rules

- **No dependencies outward.** Nothing here may import from `@application/*`, `@infrastructure/*` or `@modules/*`. The only allowed non-domain imports are `astro/zod`, `reference` from `astro:content`, and `@shared/utils/*` for generic helpers (`deSlugify`, `formatDate`).
- **No Effect, no I/O, no env access.** Rules are synchronous pure functions over plain data. If something needs to fetch, it belongs in `@application/entities`; if it needs a client, in `@infrastructure`. Pure also means *deterministic*, which the `Date` API makes easy to lose: `createDate` reads `getUTCFullYear`, never the local one, so a January start date is the same year on a machine behind UTC as it is on the CI box that prerendered the page.
- **Rules are named after the domain, not the caller.** `getReadingTime`, `deriveDescription`, `deriveVariant`, `sortFavoriteFirst`, `resolveSlugCollisions`: the DTO calls them, but they read as editorial rules, not as mapper helpers.
- **A rule is generic over the fields it reads, not over the concept that owns it.** `sortFavoriteFirst` is the single implementation of the Blog's order, and it is typed over `Pick<ArticleDTO, "isFavorite" | "publishDateISO">` so the tag index can order its Article references by the same rule rather than re-sorting them at the page. Widening a rule that way is preferable to a second sort somewhere downstream; a route that orders content on its own is the thing this rules out. **`publishDateISO` is the single implementation of what a readable publish date is**, for the same reason and after the same mistake: `order.ts` carried a copy returning `""` for an unreadable one, and `author/utils/articles.ts` a third reading it as `Date.parse(...) || 0`, so one date the article mapper refused sorted last in the tag index and read as the epoch on the About page. All three now call this rule, and it throws. That the loaders disagreed was invisible because the articles loader refuses the same entry first, which made the tolerant halves unreachable in a shipped build and left their own tests as their only readers. **`creditedSource` pairs the Republished flag with the Original Source** for the same class of reason: they are two independent Contentful fields, only one of which the banner reads, so a source named without the flag went nowhere and an editor got no signal.
- **A heading's anchor id is derived once, by the renderer.** `generateTableOfContents` takes the `ArticleHeading` list the article renderer collected while it wrote the body (level, anchor id, authored text), never rendered HTML, so the id in the Table of Contents *is* the string the body put in its `id` attribute rather than a second guess at it. This file also owns which levels belong there (`isTableOfContentsHeading`, h2 to h6) and the renderer asks it before numbering a section, which is what keeps the body's `--is: --section-N` and the entry's position in the list in step. No rule here parses or unescapes HTML: heading text arrives as the author typed it, and a heading the renderer styled, wrapped over a line or filled with inline markup can no longer go missing from the Table of Contents while rendering fine in the body.
- **The glossary is binding.** A concept, field or rule name that disagrees with [`CONTEXT.md`](../../CONTEXT.md) is a bug in one of the two; resolve it before shipping. `isFeaturedArticle` vs `isFavorite` are deliberately distinct concepts.

## shared/

Cross-concept primitives only:

- [`image.ts`](./shared/image.ts): `imageSchema`, reused by any concept carrying an image. Its `url` is an **absolute** URL and is validated as one (`z.url()`): Contentful's protocol-relative `//images.ctfassets.net/…` is absolutised at the ACL, so nothing reading this field has to finish it first
- [`reference.ts`](./shared/reference.ts): shared reference shape

## Consumers

`schema` is handed to `defineCollection` in `@application/entities/*`; `rules` are called from `@application/dto/*` and from those loaders, with one deliberate exception: `breadcrumbDTO`, which derives from the current URL rather than from content and is therefore called straight from [`Breadcrumbs.astro`](../ui/modules/core/components/breadcrumbs/Breadcrumbs.astro), no application layer in between. Nothing in this folder knows Contentful exists.
