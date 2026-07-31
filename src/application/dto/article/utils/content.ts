import type { RawArticle } from "@application/dto/article/types";
import { PAGES_ROUTES } from "@const/index";
import type { Block, Inline, Text, TopLevelBlock } from "@contentful/rich-text-types";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { getOptimizedImageUrl, getOptimizedSrcset } from "@infrastructure/images/imageOptimization";
import { escapeHtml, slugify } from "@shared/utils/strings";

export const IMAGE_EMBED_LAYOUT = {
	FULL_BLEED: "fullBleed",
	BREAKOUT: "breakout",
} as const;
const IMAGE_WRAPPER_CLASS: Record<ImageEmbedLayout, string> = {
	[IMAGE_EMBED_LAYOUT.FULL_BLEED]: "full-bleed",
	[IMAGE_EMBED_LAYOUT.BREAKOUT]: "breakout",
};
const HEADING_LEVELS = [1, 2, 3, 4, 5, 6];

type ImageEmbedLayout = (typeof IMAGE_EMBED_LAYOUT)[keyof typeof IMAGE_EMBED_LAYOUT];

export function getImageEmbedWrapperClass(layout?: string): string {
	return IMAGE_WRAPPER_CLASS[layout as ImageEmbedLayout] ?? "";
}

type HeadingBlock = Block & { content: Text[] };

interface CreateSectionParams {
	level: number;
	index: number;
	id: string;
	text: string;
	content: string;
}

interface ExtractContentFromNextNodesParams {
	nextNodes: TopLevelBlock[];
	level: number;
}

const extractContentFromNextNodes = ({ nextNodes, level }: ExtractContentFromNextNodesParams): string => {
	if (!Array.isArray(nextNodes)) {
		return "";
	}

	return nextNodes
		.map((nextNode) => {
			if (nextNode.nodeType !== BLOCKS[`HEADING_${level}` as keyof typeof BLOCKS]) {
				return nextNode.content.map((child) => ("value" in child ? child.value : "")).join("");
			}
			return "";
		})
		.join("");
};

const createSection = ({ level, id, text, content, index }: CreateSectionParams) => {
	return `
    <section style="--is: --section-${index}">
      <h${level} id="${id}" class="article__heading flex align-baseline">
        <a href="#${id}">${escapeHtml(text)}</a>
      </h${level}>
      <p>${escapeHtml(content)}</p>
    </section>
  `;
};

export function parseHeadings() {
	return Object.fromEntries(
		HEADING_LEVELS.map((level, index) => [
			BLOCKS[`HEADING_${level}` as keyof typeof BLOCKS],
			(node: HeadingBlock, nextNodes: TopLevelBlock[]) => {
				const text = node.content.map((child: Text) => child.value).join("");
				const id = slugify(text);
				const content = extractContentFromNextNodes({ nextNodes, level });
				return createSection({ level, index, id, text, content });
			},
		]),
	);
}

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
		const isYouTube = parsed.hostname === "youtube.com" || parsed.hostname.endsWith(".youtube.com");
		if (isYouTube && parsed.searchParams.has("v")) {
			return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
		}
	} catch {}
	return url;
}

export function renderOptions(rawArticle: RawArticle): RenderOptionsReturn {
	return {
		renderNode: {
			[INLINES.HYPERLINK]: (node: Node, next: Next) => {
				const inlineNode = node as Inline;
				const { uri } = inlineNode.data;
				const { hostname, pathname } = new URL(uri, "https://biancafiore.me");
				const isExternal = hostname !== "biancafiore.me";
				const isTagPage = pathname.startsWith(PAGES_ROUTES.TAG) && pathname !== PAGES_ROUTES.TAG;

				if (isExternal) {
					return `<a href="${uri}" target="_blank" rel="noopener noreferrer">${next(inlineNode.content)}<span aria-hidden="true" class="external-link-icon"> ↗</span></a>`;
				}
				if (isTagPage) {
					return `<a href="${uri}" target="_blank" rel="noopener noreferrer">${next(inlineNode.content)}</a>`;
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
				const { code, url, title, image, layout, caption, heading, text } = node.data.target.fields;

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
					const alt = escapeHtml(String(image.fields.description ?? image.fields.title ?? ""));
					const wrapperClass = getImageEmbedWrapperClass(layout);
					const displayWidth = width ?? 768;
					const optimizedSrc = getOptimizedImageUrl({
						source: `https:${imgUrl}`,
						options: { width: displayWidth, format: "webp" },
					});
					const srcset = getOptimizedSrcset({
						source: `https:${imgUrl}`,
						widths: [400, 768, 1024],
						options: { format: "webp" },
					});

					return `
						<figure${wrapperClass ? ` class="${wrapperClass}"` : ""}>
							<img
								src="${optimizedSrc}"
								srcset="${srcset}"
								sizes="auto"
								height="${height ?? ""}"
								width="${width ?? ""}"
								alt="${alt}"
								loading="lazy"
								decoding="async"
							/>
							${caption ? `<figcaption>${escapeHtml(String(caption))}</figcaption>` : ""}
						</figure>
					`;
				}

				if (contentTypeId === "splitBlock" && image?.fields?.file?.url) {
					const { url: imgUrl, details } = image.fields.file;
					const { height, width } = details?.image ?? {};
					const alt = escapeHtml(String(image.fields.description ?? image.fields.title ?? ""));
					const displayWidth = width ?? 768;
					const optimizedSrc = getOptimizedImageUrl({
						source: `https:${imgUrl}`,
						options: { width: displayWidth, format: "webp" },
					});
					const srcset = getOptimizedSrcset({
						source: `https:${imgUrl}`,
						widths: [400, 768, 1024],
						options: { format: "webp" },
					});

					return `
						<div class="split">
							<div class="split__content">
								${heading ? `<h3>${escapeHtml(String(heading))}</h3>` : ""}
								${text ? `<p>${escapeHtml(String(text))}</p>` : ""}
							</div>
							<img
								class="split__image"
								src="${optimizedSrc}"
								srcset="${srcset}"
								sizes="auto"
								height="${height ?? ""}"
								width="${width ?? ""}"
								alt="${alt}"
								loading="lazy"
								decoding="async"
							/>
						</div>
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
					const optimizedSrc = getOptimizedImageUrl({
						source: `https:${url}`,
						options: { width: displayWidth, format: "webp" },
					});
					const srcset = getOptimizedSrcset({
						source: `https:${url}`,
						widths: [400, 768, 1024],
						options: { format: "webp" },
					});
					return `
            <figure class="full-bleed">
              <img
                src="${optimizedSrc}"
                srcset="${srcset}"
                sizes="auto"
                height="${height ?? ""}"
                width="${width ?? ""}"
                alt="${escapeHtml(description ? String(description) : String(rawArticle.fields.title ?? ""))}"
                loading="lazy"
                decoding="async"
              />
              ${description ? `<figcaption>${escapeHtml(String(description))}</figcaption>` : ""}
            </figure>
          `;
				}
				return "";
			},
			...parseHeadings(),
		},
	};
}
