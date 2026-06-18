import type { BaseTagDTO } from "@application/dto/tag/types";
import type { EmDashEntry, EmDashStatus } from "@shared/application/types";
import { getEmDashCollection, getEmDashEntry, getTermsForEntries } from "emdash";

/**
 * EmDash query layer.
 *
 * EmDash runs in-process as an Astro integration backed by a libSQL/SQLite
 * database (see `astro.config.ts`), so there is no remote client to configure
 * like Contentful. These helpers wrap the runtime query functions, apply
 * project-wide defaults (published-only, high limit) and degrade gracefully to
 * an empty result so a build without a provisioned database does not crash —
 * mirroring the previous `isContentfulConfigured` guard.
 *
 * @see https://docs.emdashcms.com/guides/querying-content/
 */

export interface CollectionQuery {
	status?: EmDashStatus;
	locale?: string;
	limit?: number;
	orderBy?: string;
	order?: "asc" | "desc";
	where?: Record<string, string | string[]>;
}

const DEFAULT_LIMIT = 1000;

export async function queryCollection<T>(collection: string, query: CollectionQuery = {}): Promise<EmDashEntry<T>[]> {
	try {
		const filter = { status: "published", limit: DEFAULT_LIMIT, ...query } satisfies CollectionQuery;
		const { entries } = await getEmDashCollection(collection, filter as Parameters<typeof getEmDashCollection>[1]);
		return (entries ?? []) as unknown as EmDashEntry<T>[];
	} catch {
		return [];
	}
}

export async function queryEntry<T>(
	collection: string,
	slug: string,
	query: Pick<CollectionQuery, "locale" | "status"> = {},
): Promise<EmDashEntry<T> | null> {
	try {
		const { entry } = await getEmDashEntry(collection, slug, query);
		return (entry as unknown as EmDashEntry<T>) ?? null;
	} catch {
		return null;
	}
}

/**
 * Builds an `entry.id -> entry` lookup so reference fields (which EmDash stores
 * as entry-id strings) can be resolved into full entries within the loaders.
 */
export function indexById<T>(entries: EmDashEntry<T>[]): Map<string, EmDashEntry<T>> {
	return new Map(entries.map((entry) => [entry.id, entry]));
}

/**
 * Resolves a taxonomy (e.g. `tag`) for many entries in a single batch query,
 * returning `entryId -> tags`. In EmDash tags are taxonomy terms, not a
 * reference field, so an article's tags are read this way rather than from
 * `entry.data`.
 *
 * @see https://docs.emdashcms.com/guides/taxonomies/
 */
export async function queryTermsForEntries(
	collection: string,
	entryIds: string[],
	taxonomyName: string,
): Promise<Map<string, BaseTagDTO[]>> {
	if (entryIds.length === 0) return new Map();

	try {
		const terms = await getTermsForEntries(collection, entryIds, taxonomyName);
		return new Map(
			[...terms].map(([entryId, entryTerms]) => [
				entryId,
				entryTerms.map((term) => ({ name: term.name, slug: term.slug })),
			]),
		);
	} catch {
		return new Map();
	}
}
