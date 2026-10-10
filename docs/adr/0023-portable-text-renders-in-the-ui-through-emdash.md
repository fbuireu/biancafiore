# 23. Portable Text renders in the UI, through EmDash's components

Date: 2026-10-10

## Status

Accepted. Amends [ADR 0012](./0012-pragmatic-ddd-domain-layer-anti-corruption-layer.md).

## Context

An Article's body and a Project's description are Portable Text, EmDash's rich text format ([ADR 0021](./0021-emdash-self-hosted-cms.md)). Until now the application layer turned them into HTML: `content.ts` drove `@portabletext/to-html` with a renderer per block type, and the domain carried the body as a `string`, so the page dropped it in with `set:html`. That kept every EmDash shape behind [ADR 0012](./0012-pragmatic-ddd-domain-layer-anti-corruption-layer.md)'s anti-corruption layer, and it cost three things.

- **Every block was ours to write.** The site rendered exactly the blocks someone had written a function for. Galleries, columns, buttons, files, pullquotes, the video block EmDash 1.2 added: an editor could insert all of them, and the page dropped them without a word.
- **HTML was built as strings.** Every attribute went through `escapeHtml` and every URL through `safeUrl` by hand, in a module that is meant to map data, not to write markup.
- **The render had no Astro around it.** A string cannot hold a component, so nothing in the body could use the site's own components, and EmDash's edit mode, which renders `<PortableText>` as an inline editor, could never reach it.

EmDash ships the renderer: `emdash/ui`'s `<PortableText>`, built on `astro-portabletext`, with an Astro component per block type that checks its own fields (`Iframe`, for instance, renders only `https` sources, sandboxed). Using it means the UI imports from the CMS's package, which ADR 0012 forbade.

## Decision

**Portable Text crosses the boundary as data, and the page renders it with `emdash/ui`.**

- The domain carries rich text as `portableTextSchema` ([`src/domain/shared/portableText.ts`](../../src/domain/shared/portableText.ts)): an array of typed objects the domain never reads. It is an open format, not an EmDash type, so the domain still knows no CMS.
- **The application layer hands the page blocks ready to render, and the page decides nothing.** `prepareArticleContent` in [`content.ts`](../../src/application/dto/article/utils/content.ts) does all of the deciding:
  - a heading becomes an `articleHeading` block with its tag, its unique anchor and, from h2 down, the `--section-N` scope the Table of Contents animates on;
  - an image block becomes its CDN `src` and `srcset`, its blurhash placeholder, its alt fallback and its layout, and a split block's image the same;
  - an iframe holding a watch link, and a legacy `videoEmbed`, become the player iframe;
  - every link is settled through `prepareLinks` ([`dto/shared/portableText.ts`](../../src/application/dto/shared/portableText.ts)): `blank` for another site or a tag page, a path for the production domain, dropped for a scheme it does not trust;
  - a block that fails its schema is dropped, and so is a type no component renders, because `astro-portabletext`'s fallback for an unknown type is a hidden warning in the markup.

  It also derives the two texts the domain rules need, `prose` for the description fallback and `readableText` for the reading time, so no rule parses HTML any more. A Project's description goes through `prepareProse`, which keeps its text blocks with their links settled.
- **The page only renders.** `ArticleContent` passes the blocks to `<PortableText>` with three components of ours, `ArticleHeading`, `ArticleImage` and `SplitBlock`, each of which writes out the fields it is handed and nothing more. Every other block is EmDash's component.
- A video is EmDash's `iframe` block holding the player URL, the shape EmDash's editor writes when a YouTube or Vimeo link is pasted into it. The `videoEmbed` block the `editorialBlocks` plugin declared is gone: the import writes the `iframe` shape through the same `playerEmbed` ([`dto/shared/embeds.ts`](../../src/application/dto/shared/embeds.ts)), and one an earlier import wrote is converted on the way to the page.
- `emdash/ui` and `emdash/page` are the only `emdash` modules the UI imports: the renderer, and the page context `EmDashHead`, `EmDashBodyStart` and `EmDashBodyEnd` read. The CMS's data types (`CmsEntry`, `CmsByline`, `CmsReference`, `CmsTerm`) and its query API still stop at `application/`.

Rejected: keeping `@portabletext/to-html` and writing a renderer for each new block. It is the cost this replaces, and it grows with every block EmDash adds. Also rejected: rendering EmDash's own blocks by hand to keep the old markup byte for byte. That would be the same cost again, for markup a reader does not see.

## Consequences

- **The markup changed where EmDash's components took over.** A code block is `div.emdash-code > pre`, a rule is `hr.emdash-break`, a table sits in `div.emdash-table-wrapper` with a `thead` when its first row is all headers, and an iframe sits in `div.emdash-iframe`, sandboxed, `https` only, and titled "Embedded content" when the block has no title. An embedded page that needs a permission outside EmDash's allowlist, or that is served over `http`, no longer renders.
- **EmDash's components carry scoped styles,** whose specificity (a class plus Astro's data attribute) beats the body's unlayered rules. `_article.css` gives them the article's rhythm from `.page--article`, and a new native block that reaches the body needs adding to that list.
- **The ↗ cue on a link to another site is a stylesheet's `::after`** on `target="_blank"` links to an `http(s)` address, not a span in the markup, so it reaches links inside table cells too, which EmDash's `Table` renders with its own link component.
- **What the tests assert is the prepared blocks.** Vitest compiles no `.astro` ([ADR 0016](./0016-vitest-resolves-astro-modules-itself.md)), so the body's HTML is out of a unit test's reach. That is also why every decision lives in `prepareArticleContent`, where a test reaches it, and the components only write out fields; the rendered HTML is covered by the build and by the browser.
- **Content written before this used `videoEmbed`.** It still renders, converted to the player iframe on the way to the page, but EmDash's editor shows it as a block of an unknown type until it is replaced with an iframe block. Re-importing writes the new shape.
- **Linked from** [`src/application/AGENTS.md`](../../src/application/AGENTS.md), [`src/ui/modules/AGENTS.md`](../../src/ui/modules/AGENTS.md), [`src/domain/AGENTS.md`](../../src/domain/AGENTS.md) and the root [`AGENTS.md`](../../AGENTS.md).
