import type { SeoMetadata } from "@const/types";

export const INDEX_ROBOTS: NonNullable<SeoMetadata["robots"]> = { index: true, follow: true };

export const NOINDEX_ROBOTS: NonNullable<SeoMetadata["robots"]> = { index: false, follow: false };
