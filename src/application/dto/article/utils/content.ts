import { isTagPath } from "@const/index";
import { type ArticleHeading, isTableOfContentsHeading } from "@domain/article";
import { getOptimizedImageUrl, getOptimizedSrcset } from "@infrastructure/images/imageOptimization";
import { imagePlaceholder } from "@infrastructure/images/imagePlaceholder";
import type { PortableTextBlockComponent, PortableTextComponents } from "@portabletext/to-html";
import { escapeHtml, safeUrl, slugify } from "@shared/utils/strings";
import { z } from "@shared/utils/zod";
import { PORTABLE_TEXT_COMPONENTS, renderPortableText } from "../../shared/portableText";
import type { AnyRawArticle } from "../types";

const IMAGE_ALIGNMENT = {
	FULL: "full",
	WIDE: "wide",
} as const;
const IMAGE_WRAPPER_CLASS: Record<ImageAlignment, string> = {
	[IMAGE_ALIGNMENT.FULL]: "full-bleed",
	[IMAGE_ALIGNMENT.WIDE]: "breakout",
};
const IFRAME_EMBED_CLASS = "iframe-embed";
const HEADING_LEVELS = [1, 2, 3, 4, 5, 6];
const BLANK_ANCHOR = "section";
const DEFAULT_DISPLAY_WIDTH = 768;
const SRCSET_WIDTHS = [400, 768, 1024];
const CANONICAL_ORIGIN = "https://biancafiore.me";
const CANONICAL_HOSTNAME = "biancafiore.me";

type ImageAlignment = (typeof IMAGE_ALIGNMENT)[keyof typeof IMAGE_ALIGNMENT];

const imageAlignmentSchema = z.enum(IMAGE_ALIGNMENT);

const linkSchema = z.object({ href: z.string() });

const spanSchema = z.object({ text: z.string() });

const codeSchema = z.object({ code: z.string().min(1) });

const iframeSchema = z.object({ src: z.string().min(1), title: z.string().optional() });

const videoEmbedSchema = z.object({ url: z.string().min(1), title: z.string().min(1) });

const SAME_ORIGIN_PATH = /^\/(?!\/)/;

const imageSourceSchema = z.union([z.url(), z.string().regex(SAME_ORIGIN_PATH)]);

const imageSchema = z.object({
	asset: z.object({
		url: imageSourceSchema,
		meta: z.object({ blurhash: z.string().nullish() }).optional(),
	}),
	blurhash: z.string().optional(),
	alt: z.string().optional(),
	caption: z.string().optional(),
	width: z.number().optional(),
	height: z.number().optional(),
	alignment: z.string().optional(),
});

const splitBlockSchema = z.object({
	image: imageSourceSchema,
	alt: z.string().optional(),
	heading: z.string().optional(),
	text: z.string().optional(),
});

const markDefsSchema = z.array(z.looseObject({ _type: z.string(), _key: z.string() }));

const cellSpanSchema = z.number().int().min(1).max(100).optional();

const tableSchema = z.object({
	markDefs: markDefsSchema.optional(),
	rows: z.array(
		z.object({
			cells: z.array(
				z.object({
					content: z.array(z.looseObject({ _type: z.string() })),
					markDefs: markDefsSchema.optional(),
					isHeader: z.boolean().optional(),
					colspan: cellSpanSchema,
					rowspan: cellSpanSchema,
				}),
			),
		}),
	),
});

function getImageWrapperClass(alignment?: string): string {
	return imageAlignmentSchema.validate(alignment) ? IMAGE_WRAPPER_CLASS[alignment] : "";
}

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

function createAnchors(): (text: string) => string {
	const taken = new Set<string>();

	return (text) => {
		const base = slugify(text) || BLANK_ANCHOR;
		let id = base;

		for (let suffix = 2; taken.has(id); suffix++) {
			id = `${base}-${suffix}`;
		}

		taken.add(id);

		return id;
	};
}

const plainTextOf = (children: unknown): string =>
	Array.isArray(children) ? children.map((child) => (spanSchema.validate(child) ? child.text : "")).join("") : "";

function headingComponents(collected: ArticleHeading[]): Record<string, PortableTextBlockComponent> {
	const anchor = createAnchors();

	return Object.fromEntries(
		HEADING_LEVELS.map((level) => [
			`h${level}`,
			({ value }) => {
				const text = plainTextOf(value.children);
				const id = anchor(text);

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

interface ResponsiveImageParams {
	source: string;
	alt: string;
	width?: number;
	height?: number;
	className?: string;
	placeholder?: string;
}

function responsiveImage({ source, alt, width, height, className, placeholder }: ResponsiveImageParams): string {
	const src = getOptimizedImageUrl({ source, options: { width: width ?? DEFAULT_DISPLAY_WIDTH, format: "webp" } });
	const srcset = getOptimizedSrcset({ source, widths: SRCSET_WIDTHS, options: { format: "webp" } });
	const image = `
							<img${className ? ` class="${className}"` : ""}
								src="${escapeHtml(src)}"
								srcset="${escapeHtml(srcset)}"
								sizes="auto"
								height="${height ?? ""}"
								width="${width ?? ""}"
								alt="${escapeHtml(alt)}"
								loading="lazy"
								decoding="async"
							/>`;

	return placeholder
		? `<span class="blur-image" style="${escapeHtml(`--lqip: url("${placeholder}")`)}">${image}</span>`
		: image;
}

interface VideoFrameParams {
	src: string;
	title: string;
}

const videoFrame = ({ src, title }: VideoFrameParams): string =>
	`<iframe src="${safeUrl(src)}" width="100%" title="${escapeHtml(title)}" allowfullscreen loading="lazy"></iframe>`;

const INLINE_COMPONENTS = {
	...PORTABLE_TEXT_COMPONENTS,
	marks: {
		...PORTABLE_TEXT_COMPONENTS.marks,
		link: ({ children, value }) => {
			if (!linkSchema.validate(value) || !URL.canParse(value.href, CANONICAL_ORIGIN)) {
				return children;
			}

			const { href } = value;
			const { hostname, pathname } = new URL(href, CANONICAL_ORIGIN);
			const isExternal = hostname !== CANONICAL_HOSTNAME;

			if (isExternal) {
				return `<a href="${safeUrl(href)}" target="_blank" rel="noopener noreferrer">${children}<span aria-hidden="true" class="external-link-icon"> ↗</span></a>`;
			}
			if (isTagPath(pathname)) {
				return `<a href="${safeUrl(href)}" target="_blank" rel="noopener noreferrer">${children}</a>`;
			}
			return `<a href="${safeUrl(href)}">${children}</a>`;
		},
	},
} satisfies PortableTextComponents;

type Table = z.infer<typeof tableSchema>;
type TableCell = Table["rows"][number]["cells"][number];

interface RenderTableCellParams {
	cell: TableCell;
	tableMarkDefs: Table["markDefs"];
}

function renderTableCell({ cell, tableMarkDefs = [] }: RenderTableCellParams): string {
	const tag = cell.isHeader ? "th" : "td";
	const spans = [
		cell.colspan && cell.colspan > 1 ? ` colspan="${cell.colspan}"` : "",
		cell.rowspan && cell.rowspan > 1 ? ` rowspan="${cell.rowspan}"` : "",
	].join("");
	const inner = renderPortableText({
		value: [
			{
				_type: "block",
				_key: "cell",
				style: "normal",
				children: cell.content,
				markDefs: [...tableMarkDefs, ...(cell.markDefs ?? [])],
			},
		],
		components: INLINE_COMPONENTS,
	});

	return `<${tag}${spans}>${inner}</${tag}>`;
}

interface ArticleComponentsParams {
	title: string;
	collected: ArticleHeading[];
}

function articleComponents({ title, collected }: ArticleComponentsParams): PortableTextComponents {
	return {
		...INLINE_COMPONENTS,
		block: { ...INLINE_COMPONENTS.block, ...headingComponents(collected) },
		types: {
			...INLINE_COMPONENTS.types,
			code: ({ value }) => (codeSchema.validate(value) ? `<pre><code>${escapeHtml(value.code)}</code></pre>` : ""),
			iframe: ({ value }) =>
				iframeSchema.validate(value)
					? `<div class="${IFRAME_EMBED_CLASS}"><iframe src="${safeUrl(value.src)}" width="100%" title="${escapeHtml(value.title ?? "")}" allowfullscreen loading="lazy"></iframe></div>`
					: "",
			videoEmbed: ({ value }) =>
				videoEmbedSchema.validate(value) ? videoFrame({ src: toEmbedUrl(value.url), title: value.title }) : "",
			image: ({ value }) => {
				if (!imageSchema.validate(value)) {
					return "";
				}

				const wrapperClass = getImageWrapperClass(value.alignment);
				const placeholder = imagePlaceholder({
					blurhash: value.blurhash ?? value.asset.meta?.blurhash,
					width: value.width ?? 0,
					height: value.height ?? 0,
				});

				return `
						<figure${wrapperClass ? ` class="${wrapperClass}"` : ""}>${responsiveImage({
							source: value.asset.url,
							alt: value.alt || title,
							width: value.width,
							height: value.height,
							placeholder,
						})}
							${value.caption ? `<figcaption>${escapeHtml(value.caption)}</figcaption>` : ""}
						</figure>
					`;
			},
			splitBlock: ({ value }) => {
				if (!splitBlockSchema.validate(value)) {
					return "";
				}

				return `
						<div class="split">
							<div class="split__content">
								${value.heading ? `<h3>${escapeHtml(value.heading)}</h3>` : ""}
								${value.text ? `<p>${escapeHtml(value.text)}</p>` : ""}
							</div>${responsiveImage({ source: value.image, alt: value.alt ?? "", className: "split__image" })}
						</div>
					`;
			},
			table: ({ value }) => {
				if (!tableSchema.validate(value)) {
					return "";
				}

				const rows = value.rows.map(
					({ cells }) =>
						`<tr>${cells.map((cell) => renderTableCell({ cell, tableMarkDefs: value.markDefs })).join("")}</tr>`,
				);

				return `<table><tbody>${rows.join("")}</tbody></table>`;
			},
		},
	};
}

interface RenderedArticle {
	content: string;
	headings: ArticleHeading[];
}

export function renderArticleContent(rawArticle: AnyRawArticle): RenderedArticle {
	const headings: ArticleHeading[] = [];
	const content = renderPortableText({
		value: rawArticle.data.content,
		components: articleComponents({ title: rawArticle.data.title, collected: headings }),
	});

	return { content, headings };
}
