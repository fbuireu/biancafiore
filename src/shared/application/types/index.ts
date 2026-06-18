import type { PortableTextBlock } from "@portabletext/types";

/**
 * Shape of an EmDash `image` field as returned by the content API.
 * @see https://docs.emdashcms.com/reference/field-types/
 */
export interface EmDashImageField {
	id: string;
	url: string;
	alt?: string;
	width: number;
	height: number;
}

/**
 * Shape of an EmDash `file` field as returned by the content API.
 */
export interface EmDashFileField {
	id: string;
	url: string;
	filename: string;
	mimeType: string;
	size: number;
}

/**
 * Generic EmDash entry returned by `getEmDashCollection` / `getEmDashEntry`.
 * Fields live under `data`; EmDash also injects system fields (`slug`,
 * `status`, `publishedAt`, `updatedAt`) into `data`.
 * @see https://docs.emdashcms.com/guides/querying-content/
 */
export interface EmDashEntry<T> {
	id: string;
	data: T & {
		slug?: string;
		status?: EmDashStatus | "scheduled";
		publishedAt?: string;
		updatedAt?: string;
		createdAt?: string;
	};
}

/** Status values accepted by the EmDash query API. */
export type EmDashStatus = "draft" | "published" | "archived";

export type { PortableTextBlock };

export interface ImageFormats {
	avif: boolean;
	webp: boolean;
}

/**
 * Coordinates as stored in a `json` field on the EmDash `cities` collection.
 */
export interface GeoCoordinates {
	lat: number;
	lon: number;
}

export interface Reference<T> {
	id: string;
	collection: T;
}
