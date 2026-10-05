# src/domain

The pure domain layer. One folder per domain concept, named in the singular after the term in [CONTEXT.md](../../CONTEXT.md) (`article`, `author`, `city`, `project`, `tag`, `testimonial`, `breadcrumb`, `contact`). See ADR 0012.

## Anatomy of a concept

```
<concept>/
  schema.ts   # zod schema (`@shared/utils/zod`): what validates at the edge (a content collection, or the action input for contact)
  types.ts    # DTO type + concept-specific types (e.g. ArticleHeading, CityPeriod)
  rules.ts    # pure functions encoding editorial rules
  index.ts    # barrel: export * from each of the above
```

Not every concept needs all of them. `rules.ts` exists for `article`, `breadcrumb`, `city`, `contact`, `tag` and no one else; `contact` carries a schema and rules deciding when two addresses are the same person and bounding the cooldown, `breadcrumb` is rules + types, and every other concept carries a schema and types. Add a file when there is something to put in it.

## What the domain may reach

Nothing here imports from `@application/*`, `@infrastructure/*` or `@modules/*`. The only non-domain imports are `reference` from `astro:content`, `@shared/utils/*` for zod (`z`, from `astro/zod` with its JIT off) and generic helpers (`deSlugify`, `formatDate`), and `@const/locale` for `DEFAULT_LOCALE_STRING`, which every `localeCompare` passes so a rule orders text the same way on any machine. No Effect, no I/O, no env access: a rule is a synchronous function over plain data. Something that needs to fetch belongs in `@application/entities`, something that needs a client in `@infrastructure`. The docs test rejects a local-time `Date` API here, and the `node` test project runs in `America/New_York`, so a rule's own tests run away from UTC.

## Where the rules live

- `article/rules.ts` owns the Blog's order and the publish date. `sortFavoriteFirst` is typed over `Pick<ArticleDTO, "isFavorite" | "publishDateISO">`, so the Tag Index orders its Article references by it too; `sortReverseChronological` is the date order it sorts by before it lifts the Favorites, and the RSS feed calls that one alone, as does the authors DTO, whose Latest Article is the head of it. `publishDateISO` is what a readable publish date is: every mapper that reads one calls it, and it throws on one it cannot read. [ADR 0019](../../docs/adr/0019-three-questions-before-modelling.md) records why there is one of each.
- `creditedSource` pairs the Republished flag with the Original Source. They are two independent Contentful fields and the article page renders the banner only when the flag is set, so a source named without the flag is refused rather than dropped.
- `generateTableOfContents` takes the `ArticleHeading` list the article renderer collected while it wrote the body (level, anchor id, authored text), so the id in the Table of Contents *is* the string the body put in its `id` attribute. `article/rules.ts` also owns which levels belong there (`isTableOfContentsHeading`, h2 to h6), and the renderer asks it before numbering a section, which is what keeps the body's `--is: --section-N` and the entry's position in the list in step. Neither rule parses or unescapes HTML: heading text arrives as the author typed it.

## shared/

Cross-concept primitives only:

- [`image.ts`](./shared/image.ts): `imageSchema`, reused by any concept carrying an image. Its `url` is an **absolute** URL and is validated as one (`z.url()`): Contentful's protocol-relative `//images.ctfassets.net/…` is absolutised at the ACL, so nothing reading this field has to finish it first
- [`reference.ts`](./shared/reference.ts): shared reference shape

## Consumers

`schema` is handed to `defineCollection` in `@application/entities/*`, bar `contactFormSchema`, which validates a contact submission in the action's `input`, in `validateContact` and in the form's resolver. A rule that shapes what a collection stores is called from `@application/dto/*` or from those loaders. The rest are called by whatever holds their input, no application layer in between: `createBreadcrumbs` from [`Breadcrumbs.astro`](../ui/modules/core/components/breadcrumbs/Breadcrumbs.astro) with the current URL, `buildTagIndexBuckets` from [`pages/tags/index.astro`](../pages/tags/index.astro), `sortReverseChronological` from [`pages/rss.xml.ts`](../pages/rss.xml.ts), `formatPublishDate` and `formatPeriod` from the components that print them, and the `contact` rules from `@infrastructure/utils/persistence.ts`. Nothing in this folder knows Contentful exists.
