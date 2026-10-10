import { type ContentfulEntry, linkedId } from "./contentful.ts";
import type { BylineBody, BylineFieldBody, EntryBody, TermBody } from "./emdash.ts";
import {
	type ConversionContext,
	type PortableTextBlock,
	richTextToPortableText,
	textOf,
	type UploadedMedia,
} from "./portableText.ts";

export interface ImageValue {
	id: string;
	provider: "local";
	alt: string;
	filename: string;
	mimeType: string;
	width?: number;
	height?: number;
	blurhash?: string;
	dominantColor?: string;
	meta: { storageKey: string };
}

interface MappingContext extends Omit<ConversionContext, "title"> {
	ids: Map<string, string>;
}

export interface MapEntryParams {
	entry: ContentfulEntry;
	context: MappingContext;
}

interface ImageOfParams {
	link: unknown;
	context: MappingContext;
}

interface ImageValueParams {
	media: UploadedMedia;
	alt: string;
}

interface ReferencesToParams {
	links: unknown;
	context: MappingContext;
}

interface PortableTextOfParams {
	document: unknown;
	title: string;
	context: MappingContext;
}

const isoDate = (value: unknown): string | undefined => {
	const timestamp = typeof value === "string" ? Date.parse(value) : Number.NaN;

	return Number.isNaN(timestamp) ? undefined : new Date(timestamp).toISOString();
};

const withoutEmpty = (data: Record<string, unknown>): Record<string, unknown> =>
	Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));

export function imageValue({ media, alt }: ImageValueParams): ImageValue {
	return {
		id: media.id,
		provider: "local",
		alt,
		filename: media.filename,
		mimeType: media.mimeType,
		...(media.width && { width: media.width }),
		...(media.height && { height: media.height }),
		...(media.blurhash && { blurhash: media.blurhash }),
		...(media.dominantColor && { dominantColor: media.dominantColor }),
		meta: { storageKey: media.storageKey },
	};
}

function imageOf({ link, context }: ImageOfParams): ImageValue | undefined {
	const id = linkedId(link);
	const media = context.media.get(id ?? "");

	if (!media) return undefined;

	const asset = context.assets.get(id ?? "");

	return imageValue({ media, alt: textOf(asset?.fields.description) ?? textOf(asset?.fields.title) ?? "" });
}

function portableTextOf({ document, title, context }: PortableTextOfParams): PortableTextBlock[] {
	return richTextToPortableText({ document, context: { ...context, title } });
}

const referencesTo = ({ links, context }: ReferencesToParams): string[] =>
	(Array.isArray(links) ? links : [links]).flatMap((link) => {
		const id = context.ids.get(linkedId(link) ?? "");

		return id ? [id] : [];
	});

export function tagTerm({ entry }: Pick<MapEntryParams, "entry">): TermBody {
	return { slug: textOf(entry.fields.slug)?.trim() || undefined, label: String(entry.fields.name ?? "").trim() };
}

export function socialNetworkName(url: string): string {
	const [label = url] = new URL(url).hostname.replace(/^www\./, "").split(".");

	return label.charAt(0).toUpperCase() + label.slice(1);
}

export const BYLINE_FIELDS: BylineFieldBody[] = [
	{ slug: "job_title", label: "Job title", type: "string", translatable: false },
	{ slug: "current_company", label: "Current company", type: "string", translatable: false },
	{ slug: "social_networks", label: "Social networks (one per line: Name | URL)", type: "text", translatable: false },
];

export function authorByline({ entry, context }: MapEntryParams): BylineBody {
	const { fields } = entry;
	const socialNetworks = Array.isArray(fields.socialNetworks) ? fields.socialNetworks : [];
	const avatarMediaId = context.media.get(linkedId(fields.profileImage) ?? "")?.id;

	return {
		slug: textOf(fields.slug)?.trim(),
		displayName: String(fields.name ?? "").trim(),
		bio: textOf(fields.description),
		...(avatarMediaId && { avatarMediaId }),
		customFields: withoutEmpty({
			job_title: textOf(fields.jobTitle),
			current_company: textOf(fields.currentCompany),
			social_networks: socialNetworks.map((url) => `${socialNetworkName(url)} | ${url}`).join("\n") || undefined,
		}),
	};
}

export function cityBody({ entry, context }: MapEntryParams): EntryBody {
	const { fields } = entry;
	const coordinates = (fields.coordinates ?? {}) as { lat?: number; lon?: number };

	return {
		createdAt: entry.sys.createdAt,
		data: withoutEmpty({
			name: fields.name,
			latitude: coordinates.lat,
			longitude: coordinates.lon,
			start_date: isoDate(fields.startDate),
			end_date: isoDate(fields.endDate),
			description: fields.description,
			image: imageOf({ link: fields.image, context }),
		}),
	};
}

export function projectBody({ entry, context }: MapEntryParams): EntryBody {
	const { fields } = entry;

	return {
		slug: textOf(fields.id)?.trim(),
		createdAt: entry.sys.createdAt,
		data: withoutEmpty({
			name: fields.name,
			description: portableTextOf({ document: fields.description, title: String(fields.name ?? ""), context }),
			image: imageOf({ link: fields.image, context }),
		}),
	};
}

export function testimonialBody({ entry, context }: MapEntryParams): EntryBody {
	const { fields } = entry;

	return {
		createdAt: entry.sys.createdAt,
		data: withoutEmpty({
			author: fields.author,
			quote: fields.quote,
			role: fields.role,
			image: imageOf({ link: fields.image, context }),
		}),
	};
}

export function articleBody({ entry, context }: MapEntryParams): EntryBody {
	const { fields } = entry;
	const title = String(fields.title ?? "");
	const publishDate = isoDate(fields.publishDate);

	return {
		slug: textOf(fields.slug)?.trim(),
		createdAt: entry.sys.createdAt,
		...(publishDate && { publishedAt: publishDate }),
		data: withoutEmpty({
			title,
			content: portableTextOf({ document: fields.content, title, context }),
			description: textOf(fields.description),
			publish_date: publishDate,
			featured_image: imageOf({ link: fields.featuredImage, context }),
			featured_article: fields.featuredArticle ?? false,
			is_favorite: fields.isFavorite ?? false,
			is_republished: fields.isRepublished ?? false,
			original_source: textOf(fields.originalSource),
		}),
		bylines: referencesTo({ links: fields.author, context }).map((bylineId) => ({ bylineId })),
	};
}

export function tagTermIds({ entry, context }: MapEntryParams): string[] {
	return referencesTo({ links: entry.fields.tags ?? [], context });
}

export function relatedArticleIds({ entry, context }: MapEntryParams): string[] {
	return referencesTo({ links: entry.fields.relatedArticles ?? [], context });
}
