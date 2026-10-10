import type { RawImage } from "@application/dto/shared/images";
import type { CmsByline, CmsEntry, CmsMedia, CmsReference, CmsTerm } from "@infrastructure/cms/entries";
import { MEDIA_FILE_PATH } from "@infrastructure/cms/media";

const TIMESTAMP = "2026-01-01T00:00:00.000Z";

export const BLURHASH = "LXCacDM{RjxuOxogkCR.Dkt7t7Rj";

interface RawEntryParams<FIELDS, REFERENCE extends string> {
	id?: string;
	slug?: string | null;
	data: FIELDS;
	terms?: Record<string, CmsTerm[]>;
	bylines?: CmsByline[];
	references?: Partial<Record<REFERENCE, CmsReference[]>>;
	updatedAt?: string;
}

export function rawEntry<FIELDS, REFERENCE extends string = never>({
	id,
	slug = null,
	data,
	terms = {},
	bylines = [],
	references = {},
	updatedAt = TIMESTAMP,
}: RawEntryParams<FIELDS, REFERENCE>): CmsEntry<FIELDS, REFERENCE> {
	return {
		id: id ?? `id-${slug ?? "entry"}`,
		slug,
		data,
		terms,
		bylines,
		updatedAt,
		references: references as Record<REFERENCE, CmsReference[]>,
	};
}

export function referenceTo({ id }: CmsReference): CmsReference {
	return { id };
}

interface RawBylineParams {
	slug: string;
	displayName?: string;
	bio?: string | null;
	avatar?: CmsMedia;
	customFields?: Record<string, unknown>;
}

export function rawByline({
	slug,
	displayName = slug,
	bio = null,
	avatar,
	customFields = {},
}: RawBylineParams): CmsByline {
	return {
		id: `byline-${slug}`,
		slug,
		displayName,
		bio,
		...(avatar && { avatar }),
		customFields,
	};
}

type AvatarParams = RawImageParams;

export function avatar({ blurhash, ...image }: AvatarParams = {}): CmsMedia {
	const { id, src = "", width, height, mimeType } = rawImage({ name: "avatar.jpg", width: 400, height: 400, ...image });

	return { id, src, width, height, mimeType, ...(blurhash && { blurhash }) };
}

interface TermParams {
	slug: string;
	label?: string;
}

export function term({ slug, label = slug }: TermParams): CmsTerm {
	return { id: `term-${slug}`, slug, label };
}

interface RawImageParams {
	name?: string;
	width?: number;
	height?: number;
	mimeType?: string;
	blurhash?: string;
}

export function rawImage({
	name = "hero.jpg",
	width = 1200,
	height = 630,
	mimeType = "image/jpeg",
	blurhash,
}: RawImageParams = {}): RawImage {
	return {
		id: `media-${name}`,
		src: `${MEDIA_FILE_PATH}${name}`,
		width,
		height,
		mimeType,
		...(blurhash && { blurhash }),
	};
}
