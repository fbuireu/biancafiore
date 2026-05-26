import type { RawArticle } from "@application/dto/article/types";
import { parseHeadings } from "@application/dto/article/utils/parseHeadings";
import { getOptimizedImageUrl, getOptimizedSrcset } from "@shared/utils/imageOptimization";
import type { Block, Inline, Text } from "@contentful/rich-text-types";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";

type Node = Block | Inline | Text;
type Next = (nodes: Node[]) => string;

interface RenderOptionsReturn {
	renderNode: {
		[key: string]: (node: Node, next: Next) => string;
	};
}

function toEmbedUrl(url: string): string {
	try {
		const parsed = new URL(url);
		if (parsed.hostname === "youtu.be") {
			return `https://www.youtube.com/embed${parsed.pathname}`;
		}
		if (parsed.hostname.includes("youtube.com") && parsed.searchParams.has("v")) {
			return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
		}
	} catch {}
	return url;
}

function isExternal(url: string): boolean {
	try {
		return new URL(url).hostname !== "biancafiore.me";
	} catch {
		return false;
	}
}

export function renderOptions(rawArticle: RawArticle): RenderOptionsReturn {
	return {
		renderNode: {
			[INLINES.HYPERLINK]: (node: Node, next: Next) => {
				const inlineNode = node as Inline;
				const { uri } = inlineNode.data;

				if (isExternal(uri)) {
					return `<a href="${uri}" target="_blank" rel="noopener noreferrer">${next(inlineNode.content)}<span aria-hidden="true" class="external-link-icon"> ↗</span></a>`;
				}
				return `<a href="${uri}">${next(inlineNode.content)}</a>`;
			},
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
				const { code, url, title, image, fullBleed, caption } = node.data.target.fields;

				if (contentTypeId === "codeBlock" && code) {
					return `<pre><code>${code}</code></pre>`;
				}

				if (contentTypeId === "videoEmbed" && url && title) {
					return `<iframe src="${toEmbedUrl(url)}" width="100%" title="${title}" allowfullscreen loading="lazy"></iframe>`;
				}

				if (contentTypeId === "iframeEmbed" && url) {
					return `<iframe src="${url}" width="100%" title="${title ?? ""}" allowfullscreen loading="lazy"></iframe>`;
				}

				if (contentTypeId === "imageEmbed" && image?.fields?.file?.url) {
					const { url: imgUrl, details } = image.fields.file;
					const { height, width } = details?.image ?? {};
					const alt = caption ?? image.fields.description ?? image.fields.title ?? "";
					const wrapperClass = fullBleed ? "full-bleed" : "";
					const displayWidth = width ?? 768;
					const optimizedSrc = getOptimizedImageUrl(`https:${imgUrl}`, { width: displayWidth, format: 'webp', quality: 85 });
					const srcset = getOptimizedSrcset(`https:${imgUrl}`, [400, 768, 1024], { format: 'webp', quality: 85 });

					return `
						<figure${wrapperClass ? ` class="${wrapperClass}"` : ""}>
							<img
								src="${optimizedSrc}"
								srcset="${srcset}"
								sizes="(max-width: 768px) 100vw, 768px"
								height="${height ?? ""}"
								width="${width ?? ""}"
								alt="${alt}"
								loading="lazy"
								decoding="async"
							/>
							${caption ? `<figcaption>${caption}</figcaption>` : ""}
						</figure>
					`;
				}

				return "";
			},
			[BLOCKS.EMBEDDED_ASSET]: (node: Node) => {
				const { file, description } = node.data.target.fields;
				const { url, details } = file || {};
				const { image } = details || {};
				const { height, width } = image || {};

				if (url) {
					const displayWidth = width ?? 768;
					const optimizedSrc = getOptimizedImageUrl(`https:${url}`, { width: displayWidth, format: 'webp', quality: 85 });
					const srcset = getOptimizedSrcset(`https:${url}`, [400, 768, 1024], { format: 'webp', quality: 85 });
					return `
            <figure class="full-bleed">
              <img
                src="${optimizedSrc}"
                srcset="${srcset}"
                sizes="(max-width: 768px) 100vw, 1024px"
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
