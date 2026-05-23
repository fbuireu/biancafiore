import type { RawArticle } from "@application/dto/article/types";
import { parseHeadings } from "@application/dto/article/utils/parseHeadings";
import type { Block, Inline, Text } from "@contentful/rich-text-types";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";

type Node = Block | Inline | Text;
type Next = (nodes: Node[]) => string;

interface RenderOptionsReturn {
	renderNode: {
		[key: string]: (node: Node, next: Next) => string;
	};
}

export function renderOptions(rawArticle: RawArticle): RenderOptionsReturn {
	return {
		renderNode: {
			[INLINES.EMBEDDED_ENTRY]: (node: Node) => {
				const contentTypeId = node.data.target.sys.contentType.sys.id;
				const { slug, title } = node.data.target.fields;

				if (contentTypeId === "article" && slug && title) {
					return `<a href="/articles/${slug}">${title}</a>`;
				}
				return "";
			},
			[INLINES.ENTRY_HYPERLINK]: (node: Node, next: Next) => {
				const inlineNode = node as Inline;
				const contentTypeId = inlineNode.data.target.sys.contentType.sys.id;
				const { slug } = inlineNode.data.target.fields;

				if (contentTypeId === "article" && slug) {
					return `<a href="/articles/${slug}">${next(inlineNode.content)}</a>`;
				}
				return next(inlineNode.content);
			},
			[INLINES.ASSET_HYPERLINK]: (node: Node, next: Next) => {
				const inlineNode = node as Inline;
				const { file } = inlineNode.data.target.fields;
				const { url } = file ?? {};

				if (url) {
					return `<a href="https:${url}" target="_blank" rel="noopener noreferrer">${next(inlineNode.content)}</a>`;
				}
				return next(inlineNode.content);
			},
			[BLOCKS.EMBEDDED_ENTRY]: (node: Node) => {
				const contentTypeId = node.data.target.sys.contentType.sys.id;
				const { code, url, title } = node.data.target.fields;

				if (contentTypeId === "codeBlock" && code) {
					return `<pre><code>${code}</code></pre>`;
				}

				if (contentTypeId === "videoEmbed" && url && title) {
					return `<iframe src="${url}" width="100%" title="${title}" allowfullscreen loading="lazy"></iframe>`;
				}
				return "";
			},
			[BLOCKS.EMBEDDED_ASSET]: (node: Node) => {
				const { file, description } = node.data.target.fields;
				const { url, details } = file || {};
				const { image } = details || {};
				const { height, width } = image || {};

				if (url) {
					return `
            <figure class="full-bleed">
              <img
                src="https:${url}"
                height="${height ?? ""}"
                width="${width ?? ""}"
                alt="${description ?? rawArticle.fields.title}"
                loading="lazy"
                decoding="async"
              />
              ${description ? `<figcaption>${description}</figcaption>` : ""}
            </figure>
          `;
				}
				return "";
			},
			...parseHeadings(),
		},
	};
}
