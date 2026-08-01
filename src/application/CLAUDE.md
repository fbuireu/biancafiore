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

A DTO fed by more than one query takes them as a tuple, not as separate arguments — `authorDTO` maps `[RawAuthor[], RawArticle[]]`, which is exactly what the loader's `Effect.all` hands back.

- **DTOs are pure on purpose.** They take already-fetched raw entries and return domain DTOs. No `getEntries`, no Effect, no env, no `await` on I/O. Every `create` is synchronous, and deterministic: `formatDate` pins `timeZone: "UTC"` so a publish date does not slide a day backwards when the build runs west of UTC. This is what makes them trivially unit-testable. The line is I/O, not layering: `@infrastructure/images/imageOptimization` *is* imported here — `getOptimizedImageUrl` and `getOptimizedSrcset` only build a CDN URL string — while `getImagePlaceholder`, which fetches, is not.
- **Contentful types stop here.** `EntryFieldTypes`, `EntrySkeletonType`, `documentToHtmlString` may appear in this folder and nowhere downstream. The domain never sees a `sys` or a `fields`.
- **Derivations delegate to `@domain/<concept>/rules`.** The DTO decides *which* raw field feeds a rule; the rule decides *what the value means*. Don't inline reading-time maths or description trimming here.
- **Optional CMS fields get their defaults at this boundary**, so the domain DTO is total: `?? false` for the editorial flags an author may simply not have ticked, `?? contentHtml` for a description Contentful never received. Every default written here is asserted against the DTO layer, so removing one from the code fails the docs test.

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
4. return entries carrying an `id` — whatever is unique for that concept, *not* automatically the slug: `articles` uses the slug, `authors` and `cities` the name, `testimonials` the author, the tag index the letter bucket. `projects` is the one that arrives with its `id` already set, because `projectDTO` derives it (`fields.id`, falling back to a slugified name)
5. `schema` always comes from `@domain/<concept>`, never redeclared here. Extending it is the exception: `authors` adds `reference()` fields, which belong at this layer precisely because collection names are not a domain concern

Post-processing that *fetches* (`getImagePlaceholder`) happens in the loader, after the DTO — not inside it. Rewriting an image URL does not fetch, which is why the rich-text renderer in `dto/article/utils/content.ts` may do it inline.

**Testing a loader.** A loader is reachable from Vitest. `entities.test.ts` holds every loader to step 1 and 2 — all six bail without credentials and all six query once they have them — and `articles` and `authors` additionally have their own files covering mapping, ordering and post-processing; the other four do not yet. It costs two `vi.mock` calls per file: one for `astro:content`, and one that spreads the real `@infrastructure/cms/client` but swaps `CmsClientLive` for the stub layer in `src/tests/doubles/cmsLayer.ts`. Substitute the layer, never `runCms` — the point is to keep the real runtime, the real batching and the real `isContentfulConfigured` in the test and replace only the network. What the test cannot check is the `schema`: `reference()` has no stand-in, so no entry is ever parsed. ADR 0016 records both halves.

## Adding a content type

domain concept (`schema`/`types`/`rules`) → `dto/<concept>` → `entities/<plural>` → register the collection in `src/content.config.ts`. Add the glossary term to `CONTEXT.md` in the same change.
