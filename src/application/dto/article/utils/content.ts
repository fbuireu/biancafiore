import type { RawArticle } from "@application/dto/article/types";
import { articleHref, isTagPath } from "@const/index";
import { documentToHtmlString, type Next, type RenderNode } from "@contentful/rich-text-html-renderer";
import type { Block, Text } from "@contentful/rich-text-types";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { type ArticleHeading, isTableOfContentsHeading } from "@domain/article";
import { getOptimizedImageUrl, getOptimizedSrcset } from "@infrastructure/images/imageOptimization";
import { escapeHtml, safeUrl, slugify } from "@shared/utils/strings";
import { z } from "astro/zod";

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

const imageEmbedLayoutSchema = z.enum(IMAGE_EMBED_LAYOUT);

const hyperlinkSchema = z.object({ uri: z.string() });

const entrySchema = <Fields extends z.ZodObject>(fields: Fields) =>
	z.object({
		target: z.object({
			sys: z.object({ contentType: z.object({ sys: z.object({ id: z.string() }) }) }),
			fields,
		}),
	});

const embeddedArticleSchema = entrySchema(z.object({ slug: z.string().optional(), title: z.string().optional() }));

const assetFileSchema = z.object({
	url: z.string().min(1),
	details: z
		.object({ image: z.object({ width: z.number().optional(), height: z.number().optional() }).optional() })
		.optional(),
});

const linkedAssetSchema = z.object({ target: z.object({ fields: z.object({ file: assetFileSchema }) }) });

const embeddedAssetSchema = z.object({
	target: z.object({ fields: z.object({ file: assetFileSchema, description: z.string().optional() }) }),
});

const embeddedImageSchema = z.object({
	fields: z.object({
		file: assetFileSchema,
		description: z.string().optional(),
		title: z.string().optional(),
	}),
});

const embeddedBlockSchema = entrySchema(
	z.object({
		code: z.string().optional(),
		url: z.string().optional(),
		title: z.string().optional(),
		layout: z.string().optional(),
		caption: z.string().optional(),
		heading: z.string().optional(),
		text: z.string().optional(),
		image: z.unknown().optional(),
	}),
);

export function getImageEmbedWrapperClass(layout?: string): string {
	return imageEmbedLayoutSchema.validate(layout) ? IMAGE_WRAPPER_CLASS[layout] : "";
}

type HeadingBlock = Block & { content: Text[] };

const sectionScope = (ordinal: number): string => `--section-${ordinal}`;

interface CreateSectionParams {
	level: number;
	scope?: string;
	id: string;
	text: string;
}

const createSection = ({ level, id, text, scope }: CreateSectionParams) => {
	const timeline = scope ? ` style="--is: ${scope}"` : "";

	return `
    <section${timeline}>
      <h${level} id="${id}" class="article__heading flex align-baseline">
        <a href="#${id}">${escapeHtml(text)}</a>
      </h${level}>
    </section>
  `;
};

function parseHeadings(collected: ArticleHeading[]) {
	return Object.fromEntries(
		HEADING_LEVELS.map((level) => [
			BLOCKS[`HEADING_${level}` as keyof typeof BLOCKS],
			(node: HeadingBlock) => {
				const text = node.content.map((child: Text) => child.value).join("");
				const id = slugify(text);

				if (!isTableOfContentsHeading(level)) {
					return createSection({ level, id, text });
				}

				const scope = sectionScope(collected.length + 1);

				collected.push({ level, id, text, scope });

				return createSection({ level, scope, id, text });
			},
		]),
	);
}

interface RenderOptionsReturn {
	renderNode: RenderNode;
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

interface RenderOptionsParams {
	rawArticle: RawArticle;
	collected: ArticleHeading[];
}

function renderOptions({ rawArticle, collected }: RenderOptionsParams): RenderOptionsReturn {
	return {
		renderNode: {
			[INLINES.HYPERLINK]: ({ data, content }, next: Next) => {
				if (!hyperlinkSchema.validate(data)) {
					return next(content);
				}

				const { uri } = data;
				const { hostname, pathname } = new URL(uri, "https://biancafiore.me");
				const isExternal = hostname !== "biancafiore.me";
				const isTagPage = isTagPath(pathname);

				if (isExternal) {
					return `<a href="${safeUrl(uri)}" target="_blank" rel="noopener noreferrer">${next(content)}<span aria-hidden="true" class="external-link-icon"> ↗</span></a>`;
				}
				if (isTagPage) {
					return `<a href="${safeUrl(uri)}" target="_blank" rel="noopener noreferrer">${next(content)}</a>`;
				}
				return `<a href="${safeUrl(uri)}">${next(content)}</a>`;
			},
			[INLINES.EMBEDDED_ENTRY]: ({ data }) => {
				if (!embeddedArticleSchema.validate(data)) {
					return "";
				}

				const contentTypeId = data.target.sys.contentType.sys.id;
				const { slug, title } = data.target.fields;

				if (contentTypeId === "article" && slug && title) {
					return `<a href="${escapeHtml(articleHref(slug))}">${escapeHtml(title)}</a>`;
				}
				return "";
			},
			[INLINES.ENTRY_HYPERLINK]: ({ data, content }, next: Next) => {
				if (!embeddedArticleSchema.validate(data)) {
					return next(content);
				}

				const contentTypeId = data.target.sys.contentType.sys.id;
				const { slug } = data.target.fields;

				if (contentTypeId === "article" && slug) {
					return `<a href="${escapeHtml(articleHref(slug))}">${next(content)}</a>`;
				}
				return next(content);
			},
			[INLINES.ASSET_HYPERLINK]: ({ data, content }, next: Next) => {
				if (!linkedAssetSchema.validate(data)) {
					return next(content);
				}

				const { url } = data.target.fields.file;

				return `<a href="${safeUrl(`https:${url}`)}" target="_blank" rel="noopener noreferrer">${next(content)}</a>`;
			},
			[BLOCKS.EMBEDDED_ENTRY]: ({ data }) => {
				if (!embeddedBlockSchema.validate(data)) {
					return "";
				}

				const contentTypeId = data.target.sys.contentType.sys.id;
				const { code, url, title, image, layout, caption, heading, text } = data.target.fields;

				if (contentTypeId === "codeBlock" && code) {
					return `<pre><code>${escapeHtml(code)}</code></pre>`;
				}

				if (contentTypeId === "videoEmbed" && url && title) {
					return `<iframe src="${safeUrl(toEmbedUrl(url))}" width="100%" title="${escapeHtml(title)}" allowfullscreen loading="lazy"></iframe>`;
				}

				if (contentTypeId === "iframeEmbed" && url) {
					return `<iframe src="${safeUrl(url)}" width="100%" title="${escapeHtml(title ?? "")}" allowfullscreen loading="lazy"></iframe>`;
				}

				if (!embeddedImageSchema.validate(image)) {
					return "";
				}

				if (contentTypeId === "imageEmbed") {
					const { url: imgUrl, details } = image.fields.file;
					const { height, width } = details?.image ?? {};
					const alt = escapeHtml(image.fields.description ?? image.fields.title ?? "");
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
								src="${escapeHtml(optimizedSrc)}"
								srcset="${escapeHtml(srcset)}"
								sizes="auto"
								height="${height ?? ""}"
								width="${width ?? ""}"
								alt="${alt}"
								loading="lazy"
								decoding="async"
							/>
							${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}
						</figure>
					`;
				}

				if (contentTypeId === "splitBlock") {
					const { url: imgUrl, details } = image.fields.file;
					const { height, width } = details?.image ?? {};
					const alt = escapeHtml(image.fields.description ?? image.fields.title ?? "");
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
								${heading ? `<h3>${escapeHtml(heading)}</h3>` : ""}
								${text ? `<p>${escapeHtml(text)}</p>` : ""}
							</div>
							<img
								class="split__image"
								src="${escapeHtml(optimizedSrc)}"
								srcset="${escapeHtml(srcset)}"
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
			[BLOCKS.EMBEDDED_ASSET]: ({ data }) => {
				if (!embeddedAssetSchema.validate(data)) {
					return "";
				}

				const { file, description } = data.target.fields;
				const { url, details } = file;
				const { height, width } = details?.image ?? {};

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
                src="${escapeHtml(optimizedSrc)}"
                srcset="${escapeHtml(srcset)}"
                sizes="auto"
                height="${height ?? ""}"
                width="${width ?? ""}"
                alt="${escapeHtml(description || String(rawArticle.fields.title ?? ""))}"
                loading="lazy"
                decoding="async"
              />
              ${description ? `<figcaption>${escapeHtml(description)}</figcaption>` : ""}
            </figure>
          `;
			},
			...parseHeadings(collected),
		},
	};
}

export interface RenderedArticle {
	content: string;
	headings: ArticleHeading[];
}

export function renderArticleContent(rawArticle: RawArticle): RenderedArticle {
	const headings: ArticleHeading[] = [];
	const content = documentToHtmlString(rawArticle.fields.content, renderOptions({ rawArticle, collected: headings }));

	return { content, headings };
}
