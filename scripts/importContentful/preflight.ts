import { type ContentfulAsset, type ContentfulEntry, contentTypeOf, linkedId } from "./contentful.ts";

export const UPLOADABLE_TYPES = [
	"image/png",
	"image/jpeg",
	"image/gif",
	"image/webp",
	"image/avif",
	"image/jxl",
	"video/",
	"audio/",
	"application/pdf",
];

interface ReferenceFieldsParams {
	entry: ContentfulEntry;
	entries: Map<string, ContentfulEntry>;
}

interface PreflightParams {
	migrated: ContentfulEntry[];
	entries: Map<string, ContentfulEntry>;
}

export interface Preflight {
	errors: string[];
	warnings: string[];
}

const REFERENCE_FIELDS: Record<string, string[]> = { article: ["author", "tags", "relatedArticles"] };

export const isUploadable = (contentType: string): boolean =>
	UPLOADABLE_TYPES.some((allowed) =>
		allowed.endsWith("/") ? contentType.startsWith(allowed) : contentType === allowed,
	);

export function unuploadableAsset(asset: ContentfulAsset | undefined): string | undefined {
	const contentType = asset?.fields.file?.contentType;

	return contentType && !isUploadable(contentType) ? contentType : undefined;
}

const linksOf = (value: unknown): unknown[] => (Array.isArray(value) ? value : value === undefined ? [] : [value]);

function danglingReferences({ entry, entries }: ReferenceFieldsParams): string[] {
	return (REFERENCE_FIELDS[contentTypeOf(entry)] ?? []).flatMap((field) =>
		linksOf(entry.fields[field]).flatMap((link) => {
			const id = linkedId(link);

			return id && entries.has(id)
				? []
				: [
						`${contentTypeOf(entry)} ${entry.sys.id} links ${field} to ${id ?? "nothing"}, which is not published in Contentful, so the link is dropped`,
					];
		}),
	);
}

export function preflight({ migrated, entries }: PreflightParams): Preflight {
	const warnings = migrated.flatMap((entry) => danglingReferences({ entry, entries }));
	const errors = migrated
		.filter((entry) => contentTypeOf(entry) === "article")
		.flatMap((entry) => {
			const author = entries.get(linkedId(entry.fields.author) ?? "");

			return author && contentTypeOf(author) === "author"
				? []
				: [`article ${entry.sys.id} has no published author, and the site refuses an Article no byline credits`];
		});

	return { errors, warnings };
}
