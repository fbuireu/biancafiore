# src/application

The anti-corruption layer between Contentful and the domain. Two halves, `dto/` (mapping) and `entities/` (loading). See ADR 0012 for the layering, and ADR 0002 for why the content is in Contentful at all — this folder is what keeps that choice reversible.

## dto/ — Contentful → domain

```
dto/<concept>/
  <concept>DTO.ts   # export const xDTO: BaseDTO<RawX[], XDTO[]> = { create }
  types.ts          # XSkeleton (EntrySkeletonType) + RawX = Entry<XSkeleton, undefined>
  utils/            # mapping helpers local to this concept
  index.ts          # re-exports the DTO only
```

- **DTOs are pure on purpose.** They take already-fetched raw entries and return domain DTOs. No `getEntries`, no Effect, no env, no `await` on I/O. This is what makes them trivially unit-testable.
- **Contentful types stop here.** `EntryFieldTypes`, `EntrySkeletonType`, `documentToHtmlString` may appear in this folder and nowhere downstream. The domain never sees a `sys` or a `fields`.
- **Derivations delegate to `@domain/<concept>/rules`.** The DTO decides *which* raw field feeds a rule; the rule decides *what the value means*. Don't inline reading-time maths or description trimming here.
- Optional CMS fields get their defaults at this boundary (`?? false`, `?? contentHtml`), so the domain DTO is total.

## entities/ — Astro content collections

```
entities/<plural>/
  <plural>.ts   # defineCollection({ loader, schema })
  index.ts
```

The loader is the only place content I/O happens:

1. bail out with `isContentfulConfigured()` so builds work without credentials
2. fetch through `runCms(Effect.gen(...))` with `CmsClient` — batch multiple queries with `Effect.all(..., { concurrency: "unbounded" })`
3. map with the concept's DTO, apply domain ordering rules (`sortFavoriteFirst`)
4. return entries carrying an `id` (usually the slug; the tag index uses the letter bucket)
5. `schema` always comes from `@domain/<concept>`, never redeclared here

Post-processing that needs infrastructure (`getImagePlaceholder`) happens in the loader, after the DTO — not inside it.

## Adding a content type

domain concept (`schema`/`types`/`rules`) → `dto/<concept>` → `entities/<plural>` → register the collection in `src/content.config.ts`. Add the glossary term to `CONTEXT.md` in the same change.
