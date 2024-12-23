import type { RawArticle } from "@application/dto/article/types";
import { parseHeadings } from "@application/dto/article/utils/parseHeadings";
import type { Block, Inline, Text } from "@contentful/rich-text-types";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";

type Node = Block | Inline | Text;

interface RenderOptionsReturnType {
	renderNode: {
		[INLINES.EMBEDDED_ENTRY]: (node: Node) => string;
		[BLOCKS.EMBEDDED_ENTRY]: (node: Node) => string;
		[BLOCKS.EMBEDDED_ASSET]: (node: Node) => string;
		[key: string]: (node: Node) => string;
	};
}

export function renderOptions(rawArticle: RawArticle): RenderOptionsReturnType {
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
			[BLOCKS.EMBEDDED_ENTRY]: (node: Node) => {
				const contentTypeId = node.data.target.sys.contentType.sys.id;
				const { code, embedUrl, title } = node.data.target.fields;

				if (contentTypeId === "codeBlock" && code) {
					return `<pre><code>${code}</code></pre>`;
				}

				if (contentTypeId === "videoEmbed" && embedUrl && title) {
					return `<iframe src="${embedUrl}" height="100%" width="100%" title="${title}" allowfullscreen></iframe>`;
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
