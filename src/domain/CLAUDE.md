# src/domain

The pure domain layer. One folder per domain concept, named in the singular after the term in [CONTEXT.md](../../CONTEXT.md) (`article`, `author`, `city`, `project`, `tag`, `testimonial`, `breadcrumb`, `contact`). See ADR 0012.

## Anatomy of a concept

```
<concept>/
  schema.ts   # astro/zod schema — what validates at the edge: a content collection, or the action input for contact
  types.ts    # DTO type + concept-specific types (e.g. ArticleType, ArticleHeading)
  rules.ts    # pure functions encoding editorial rules
  index.ts    # barrel: export * from each of the above
```

Not every concept needs all three. `rules.ts` is the exception rather than the norm — it exists for `article`, `breadcrumb`, `city`, `contact`, `tag` and no one else; `breadcrumb` is rules + types, `contact` is a schema and one rule, and the rest are schema + types. Add a file when there is something to put in it.

## Hard rules

- **No dependencies outward.** Nothing here may import from `@application/*`, `@infrastructure/*` or `@modules/*`. The only allowed non-domain imports are `astro/zod`, `reference` from `astro:content`, and `@shared/utils/*` for generic helpers (`deSlugify`).
- **No Effect, no I/O, no env access.** Rules are synchronous pure functions over plain data. If something needs to fetch, it belongs in `@application/entities`; if it needs a client, in `@infrastructure`. Pure also means *deterministic*, which the `Date` API makes easy to lose: `createDate` reads `getUTCFullYear`, never the local one, so a January start date is the same year on a machine behind UTC as it is on the CI box that prerendered the page.
- **Rules are named after the domain, not the caller.** `getReadingTime`, `deriveDescription`, `deriveVariant`, `sortFavoriteFirst`, `resolveSlugCollisions`, `normalizeEmail` — the DTO calls them, but they read as editorial rules, not as mapper helpers.
- **A rule is generic over the fields it reads, not over the concept that owns it.** `sortFavoriteFirst` is the single implementation of the Blog's order, and it is typed over `Pick<ArticleDTO, "isFavorite" | "publishDateISO">` so the tag index can order its Article references by the same rule rather than re-sorting them at the page. Widening a rule that way is preferable to a second sort somewhere downstream; a route that orders content on its own is the thing this rules out.
- **A heading's anchor id is derived once, by the renderer.** `generateTableOfContents` takes the `ArticleHeading` list the article renderer collected while it wrote the body — level, anchor id, authored text — never rendered HTML, so the id in the Table of Contents *is* the string the body put in its `id` attribute rather than a second guess at it. This file also owns which levels belong there (`isTableOfContentsHeading`, h2 to h6) and the renderer asks it before numbering a section, which is what keeps the body's `--is: --section-N` and the entry's position in the list in step. No rule here parses or unescapes HTML: heading text arrives as the author typed it, and a heading the renderer styled, wrapped over a line or filled with inline markup can no longer go missing from the Table of Contents while rendering fine in the body.
- **A rule that two layers both depend on lives here, even when only infrastructure calls it.** `normalizeEmail` (`contact/rules.ts`) answers when two addresses are the same person: it trims, lowercases and strips the `+alias` segment. It sat in `@infrastructure/utils/email` while the contact action built a second copy of the submission with it and then chose, by hand, which step got which copy — two values of the same TypeScript type, so swapping them type-checked and mailed the wrong address. Now `checkDuplicatedEntries` and `saveContact` apply it themselves and the orchestrator normalises nothing. `contactCooldownStart` sits beside it for the same reason: `CONTACT_COOLDOWN_HOURS` is both the window a query asks about and the number the refusal prints, and those two cannot be allowed to drift.
- **The glossary is binding.** A concept, field or rule name that disagrees with `CONTEXT.md` is a bug in one of the two — resolve it before shipping. `isFeaturedArticle` vs `isFavorite` are deliberately distinct concepts.

## shared/

Cross-concept primitives only:

- `image.ts` — `imageSchema` and the `ImageDTO` inferred from it, reused by any concept carrying an image. Its `url` is an **absolute** URL and is validated as one (`z.url()`): Contentful's protocol-relative `//images.ctfassets.net/…` is absolutised at the ACL, so nothing reading this field has to finish it first
- `reference.ts` — shared reference shape

## Consumers

`schema` is handed to `defineCollection` in `@application/entities/*`; `rules` are called from `@application/dto/*` and from those loaders — with one deliberate exception, `breadcrumbDTO`, which derives from the current URL rather than from content and is therefore called straight from `Breadcrumbs.astro`, no application layer in between. Nothing in this folder knows Contentful exists.
