# src/domain

The pure domain layer. One folder per domain concept, named in the singular after the term in [CONTEXT.md](../../CONTEXT.md) (`article`, `author`, `city`, `project`, `tag`, `testimonial`, `breadcrumb`, `contact`). See ADR 0012.

## Anatomy of a concept

```
<concept>/
  schema.ts   # astro/zod schema — what validates at the edge: a content collection, or the action input for contact
  types.ts    # DTO type + concept-specific unions/enums (e.g. ArticleType)
  rules.ts    # pure functions encoding editorial rules
  index.ts    # barrel: export * from each of the above
```

Not every concept needs all three. `rules.ts` is the exception rather than the norm — it exists for `article`, `breadcrumb`, `city` and no one else; `contact` is schema-only, `breadcrumb` is rules + types, and the rest are schema + types. Add a file when there is something to put in it.

## Hard rules

- **No dependencies outward.** Nothing here may import from `@application/*`, `@infrastructure/*` or `@modules/*`. The only allowed non-domain imports are `astro/zod`, `reference` from `astro:content`, and `@shared/utils/*` for generic helpers (`slugify`, `deSlugify`).
- **No Effect, no I/O, no env access.** Rules are synchronous pure functions over plain data. If something needs to fetch, it belongs in `@application/entities`; if it needs a client, in `@infrastructure`. Pure also means *deterministic*, which the `Date` API makes easy to lose: `createDate` reads `getUTCFullYear`, never the local one, so a January start date is the same year on a machine behind UTC as it is on the CI box that prerendered the page.
- **Rules are named after the domain, not the caller.** `getReadingTime`, `deriveDescription`, `deriveVariant`, `sortFavoriteFirst` — the DTO calls them, but they read as editorial rules, not as mapper helpers.
- **One rule knows about HTML, and it is coupled to a renderer it cannot see.** `generateTableOfContents` reads rendered article HTML, so it strips tags *and* decodes entities before slugifying. It has to: `articleDTO` feeds it the plain `documentToHtmlString` output, which escapes every text node, while the anchor ids in the body come from `parseHeadings`, which slugifies the raw heading text. Drop the decode and a heading containing `&` gets a table-of-contents id of `tips-amp-tricks` pointing at an anchor called `tips-tricks` — a dead link, and nothing type-checks the two sides against each other.
- **The glossary is binding.** A concept, field or rule name that disagrees with `CONTEXT.md` is a bug in one of the two — resolve it before shipping. `isFeaturedArticle` vs `isFavorite` are deliberately distinct concepts.

## shared/

Cross-concept primitives only:

- `baseDTO.ts` — `BaseDTO<INPUT, OUTPUT, CONFIGURATION>`, the `create` contract every application DTO implements
- `image.ts` — `imageSchema`, reused by any concept carrying an image
- `reference.ts` — shared reference shape

## Consumers

`schema` is handed to `defineCollection` in `@application/entities/*`; `rules` are called from `@application/dto/*` and from those loaders — with one deliberate exception, `breadcrumbDTO`, which derives from the current URL rather than from content and is therefore called straight from `Breadcrumbs.astro`, no application layer in between. Nothing in this folder knows Contentful exists.
