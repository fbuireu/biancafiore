import { type ArticleHeading, isTableOfContentsHeading } from "@domain/article";
import type { PortableText } from "@domain/shared/portableText";
import { getOptimizedImageUrl, getOptimizedSrcset } from "@infrastructure/images/imageOptimization";
import { imagePlaceholder } from "@infrastructure/images/imagePlaceholder";
import { slugify } from "@shared/utils/strings";
import { z } from "@shared/utils/zod";
import { playerEmbed } from "../../shared/embeds";
import { prepareLinks, proseOf, readableTextOf } from "../../shared/portableText";
import type { AnyRawArticle } from "../types";

const IMAGE_LAYOUT = {
	full: "full-bleed",
	wide: "breakout",
} as const;
const HEADING_STYLE = /^h([1-6])$/;
const BLANK_ANCHOR = "section";
const DEFAULT_DISPLAY_WIDTH = 768;
const SRCSET_WIDTHS = [400, 768, 1024];
const HEADING_TYPE = "articleHeading";
const SPLIT_BLOCK_TYPE = "splitBlock";
const LEGACY_VIDEO_TYPE = "videoEmbed";
const EMDASH_RENDERED_TYPES = new Set([
	"block",
	"break",
	"button",
	"buttons",
	"code",
	"columns",
	"cover",
	"embed",
	"file",
	"gallery",
	"iframe",
	"pullquote",
	"table",
	"video",
]);

type PortableTextNode = PortableText[number];

const imageLayoutSchema = z.enum(Object.keys(IMAGE_LAYOUT) as [keyof typeof IMAGE_LAYOUT]);

const spanSchema = z.object({ text: z.string() });

const headingSchema = z.looseObject({
	_type: z.literal("block"),
	_key: z.string().optional(),
	style: z.string().regex(HEADING_STYLE),
	children: z.array(z.unknown()),
});

const SAME_ORIGIN_PATH = /^\/(?!\/)/;

const imageSourceSchema = z.union([z.url(), z.string().regex(SAME_ORIGIN_PATH)]);

const imageSchema = z.looseObject({
	_type: z.literal("image"),
	_key: z.string().optional(),
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

const splitBlockSchema = z.looseObject({
	_type: z.literal(SPLIT_BLOCK_TYPE),
	_key: z.string().optional(),
	image: imageSourceSchema,
	alt: z.string().optional(),
	heading: z.string().optional(),
	text: z.string().optional(),
});

const httpsUrlSchema = z.url({ protocol: /^https$/ });

const iframeSchema = z.looseObject({ _type: z.literal("iframe"), src: httpsUrlSchema });

const legacyVideoSchema = z.looseObject({
	_type: z.literal(LEGACY_VIDEO_TYPE),
	_key: z.string().optional(),
	url: z.string(),
	title: z.string().optional(),
});

const codeSchema = z.looseObject({ _type: z.literal("code"), code: z.string().min(1) });

const embedSchema = z.looseObject({ _type: z.literal("embed"), url: z.string().min(1) });

const sectionScope = (ordinal: number): string => `--section-${ordinal}`;

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

const plainTextOf = (children: unknown[]): string =>
	children.map((child) => (spanSchema.validate(child) ? child.text : "")).join("");

interface ResponsiveSourceParams {
	source: string;
	width?: number;
}

const responsiveSource = ({ source, width }: ResponsiveSourceParams) => ({
	src: getOptimizedImageUrl({ source, options: { width: width ?? DEFAULT_DISPLAY_WIDTH, format: "webp" } }),
	srcset: getOptimizedSrcset({ source, widths: SRCSET_WIDTHS, options: { format: "webp" } }),
});

interface PrepareImageParams {
	node: PortableTextNode;
	title: string;
}

function prepareImage({ node, title }: PrepareImageParams): PortableTextNode[] {
	if (!imageSchema.validate(node)) {
		return [];
	}

	const { _key, asset, alt, caption, width, height, alignment } = node;
	const placeholder = imagePlaceholder({
		blurhash: node.blurhash ?? asset.meta?.blurhash ?? undefined,
		width: width ?? 0,
		height: height ?? 0,
	});

	return [
		{
			_type: "image",
			_key,
			...responsiveSource({ source: asset.url, width }),
			alt: alt || title,
			...(width && { width }),
			...(height && { height }),
			...(placeholder && { placeholder }),
			...(caption && { caption }),
			...(imageLayoutSchema.validate(alignment) && { layout: IMAGE_LAYOUT[alignment] }),
		},
	];
}

function prepareSplitBlock(node: PortableTextNode): PortableTextNode[] {
	if (!splitBlockSchema.validate(node)) {
		return [];
	}

	const { _key, image, alt, heading, text } = node;

	return [
		{
			_type: SPLIT_BLOCK_TYPE,
			_key,
			...responsiveSource({ source: image }),
			alt: alt ?? "",
			...(heading && { heading }),
			...(text && { text }),
		},
	];
}

function prepareIframe(node: PortableTextNode): PortableTextNode[] {
	if (!iframeSchema.validate(node)) {
		return [];
	}

	const player = playerEmbed(node.src);

	return [player ? { ...node, ...player } : node];
}

function prepareLegacyVideo(node: PortableTextNode): PortableTextNode[] {
	if (!legacyVideoSchema.validate(node)) {
		return [];
	}

	const player = playerEmbed(node.url);

	return player ? [{ _type: "iframe", _key: node._key, ...player, ...(node.title && { title: node.title }) }] : [];
}

interface PrepareBlockParams {
	node: PortableTextNode;
	title: string;
}

function prepareBlock({ node, title }: PrepareBlockParams): PortableTextNode[] {
	switch (node._type) {
		case "image":
			return prepareImage({ node, title });
		case SPLIT_BLOCK_TYPE:
			return prepareSplitBlock(node);
		case "iframe":
			return prepareIframe(node);
		case LEGACY_VIDEO_TYPE:
			return prepareLegacyVideo(node);
		case "code":
			return codeSchema.validate(node) ? [node] : [];
		case "embed":
			return embedSchema.validate(node) ? [node] : [];
		default:
			return EMDASH_RENDERED_TYPES.has(node._type) ? [node] : [];
	}
}

interface PreparedArticleContent {
	content: PortableText;
	headings: ArticleHeading[];
	prose: string;
	readableText: string;
}

export function prepareArticleContent(rawArticle: AnyRawArticle): PreparedArticleContent {
	const anchor = createAnchors();
	const headings: ArticleHeading[] = [];
	const linked = prepareLinks(rawArticle.data.content);
	const content = linked.flatMap((node) => {
		if (!headingSchema.validate(node)) {
			return prepareBlock({ node, title: rawArticle.data.title });
		}

		const level = Number(node.style.slice(1));
		const text = plainTextOf(node.children);
		const id = anchor(text);
		const heading = { _type: HEADING_TYPE, _key: node._key, tag: node.style, anchor: id, text };

		if (!isTableOfContentsHeading(level)) {
			return [heading];
		}

		const scope = sectionScope(headings.length + 1);

		headings.push({ level, id, text, scope });

		return [{ ...heading, scope }];
	});

	return { content, headings, prose: proseOf(linked), readableText: readableTextOf(content) };
}
