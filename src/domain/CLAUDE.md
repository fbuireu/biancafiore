# src/domain

The pure domain layer. One folder per domain concept, named in the singular after the term in [CONTEXT.md](../../CONTEXT.md) (`article`, `author`, `city`, `project`, `tag`, `testimonial`, `breadcrumb`, `contact`). See ADR 0012.

## Anatomy of a concept

```
<concept>/
  schema.ts   # astro/zod schema — the shape a content collection validates against
  types.ts    # DTO type + concept-specific unions/enums (e.g. ArticleType)
  rules.ts    # pure functions encoding editorial rules
  index.ts    # barrel: export * from each of the above
```

Not every concept needs all three: `contact` is schema-only, `breadcrumb` is rules + types. Add a file when there is something to put in it.

## Hard rules

- **No dependencies outward.** Nothing here may import from `@application/*`, `@infrastructure/*` or `@modules/*`. The only allowed non-domain imports are `astro/zod`, `reference` from `astro:content`, and `@shared/utils/*` for generic helpers (`slugify`, `formatDate`).
- **No Effect, no I/O, no env access.** Rules are synchronous pure functions over plain data. If something needs to fetch, it belongs in `@application/entities`; if it needs a client, in `@infrastructure`.
- **Rules are named after the domain, not the caller.** `getReadingTime`, `deriveDescription`, `deriveVariant`, `sortFavoriteFirst` — the DTO calls them, but they read as editorial rules, not as mapper helpers.
- **The glossary is binding.** A concept, field or rule name that disagrees with `CONTEXT.md` is a bug in one of the two — resolve it before shipping. `isFeaturedArticle` vs `isFavorite` are deliberately distinct concepts.

## shared/

Cross-concept primitives only:

- `baseDTO.ts` — `BaseDTO<INPUT, OUTPUT, CONFIGURATION>`, the `create` contract every application DTO implements
- `image.ts` — `imageSchema`, reused by any concept carrying an image
- `reference.ts` — shared reference shape

## Consumers

`schema` is handed to `defineCollection` in `@application/entities/*`; `rules` are called from `@application/dto/*` and from those loaders. Nothing in this folder knows Contentful exists.
