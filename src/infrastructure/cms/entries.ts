import { type Context, Effect, ManagedRuntime } from "effect";
import {
	CmsClient,
	CmsClientLive,
	type CmsItem,
	type CmsMenuItem,
	type CmsReference,
	type CmsSiteSettings,
	type ReadEntryQuery,
} from "./client";

export type { CmsByline, CmsMedia, CmsMenuItem, CmsReference, CmsSiteSettings, CmsTerm } from "./client";

export const EMDASH_MAX_PAGE_SIZE = 100;
const REFERENCE_READS_IN_FLIGHT = 8;

export interface EntriesQuery<REFERENCE extends string = string> {
	collection: string;
	references?: readonly REFERENCE[];
	orderBy?: string;
	order?: "asc" | "desc";
	limit?: number;
}

interface ReferencesQuery {
	collection: string;
	id: string;
	field: string;
}

export interface CmsEntry<FIELDS = Record<string, unknown>, REFERENCE extends string = never>
	extends Omit<CmsItem, "data"> {
	data: FIELDS;
	references: Record<REFERENCE, CmsReference[]>;
}

type AnyEntry = CmsEntry<unknown, string>;

type ReferenceOf<ENTRY> = ENTRY extends CmsEntry<unknown, infer REFERENCE> ? REFERENCE : never;

type RawEntries<ENTRIES extends readonly AnyEntry[]> = { [INDEX in keyof ENTRIES]: ENTRIES[INDEX][] };

type Cms = Context.Tag.Service<CmsClient>;

interface FetchEveryPageParams {
	cms: Cms;
	query: EntriesQuery;
}

interface FetchEveryReferenceParams extends ReferencesQuery {
	cms: Cms;
}

interface WithReferencesParams {
	cms: Cms;
	query: EntriesQuery;
	items: CmsItem[];
}

const cmsRuntime = ManagedRuntime.make(CmsClientLive);

const fetchEveryPage = ({ cms, query }: FetchEveryPageParams) =>
	Effect.gen(function* () {
		const wanted = query.limit;
		const items: CmsItem[] = [];
		let cursor: string | undefined;

		while (wanted === undefined || items.length < wanted) {
			const remaining = wanted === undefined ? EMDASH_MAX_PAGE_SIZE : wanted - items.length;
			const page = yield* cms.listEntries({
				collection: query.collection,
				orderBy: query.orderBy,
				order: query.order,
				cursor,
				limit: Math.min(remaining, EMDASH_MAX_PAGE_SIZE),
			});

			items.push(...page.items);

			if (page.items.length === 0 || !page.nextCursor) break;

			cursor = page.nextCursor;
		}

		return items;
	});

const fetchEveryReference = ({ cms, collection, id, field }: FetchEveryReferenceParams) =>
	Effect.gen(function* () {
		const references: CmsReference[] = [];
		let cursor: string | undefined;

		do {
			const page = yield* cms.listReferences({ collection, id, field, cursor, limit: EMDASH_MAX_PAGE_SIZE });

			references.push(...page.children);
			cursor = page.nextCursor;
		} while (cursor);

		return references;
	});

const withReferences = ({ cms, query, items }: WithReferencesParams) =>
	Effect.forEach(
		items,
		(item) =>
			Effect.forEach(query.references ?? [], (field) =>
				fetchEveryReference({ cms, collection: query.collection, id: item.id, field }).pipe(
					Effect.map((references) => [field, references] as const),
				),
			).pipe(Effect.map((references) => ({ ...item, references: Object.fromEntries(references) }))),
		{ concurrency: REFERENCE_READS_IN_FLIGHT },
	);

export const fetchEntries = <ENTRIES extends readonly AnyEntry[]>(
	...queries: { [INDEX in keyof ENTRIES]: EntriesQuery<ReferenceOf<ENTRIES[INDEX]>> }
): Promise<RawEntries<ENTRIES>> =>
	cmsRuntime.runPromise(
		Effect.gen(function* () {
			const cms = yield* CmsClient;
			const collections = yield* Effect.all(
				(queries as readonly EntriesQuery[]).map((query) =>
					fetchEveryPage({ cms, query }).pipe(Effect.flatMap((items) => withReferences({ cms, query, items }))),
				),
				{ concurrency: "unbounded" },
			);

			return collections as RawEntries<ENTRIES>;
		}),
	);

export const fetchEntry = <ENTRY extends AnyEntry>(query: ReadEntryQuery): Promise<ENTRY | undefined> =>
	cmsRuntime.runPromise(
		CmsClient.pipe(
			Effect.flatMap((cms) => cms.readEntry(query)),
			Effect.map((item) => (item ? ({ ...item, references: {} } as ENTRY) : undefined)),
		),
	);

export const fetchReferences = (query: ReferencesQuery): Promise<CmsReference[]> =>
	cmsRuntime.runPromise(CmsClient.pipe(Effect.flatMap((cms) => fetchEveryReference({ cms, ...query }))));

export const fetchSiteSettings = (): Promise<CmsSiteSettings> =>
	cmsRuntime.runPromise(CmsClient.pipe(Effect.flatMap((cms) => cms.readSiteSettings())));

export const fetchMenu = (name: string): Promise<CmsMenuItem[] | undefined> =>
	cmsRuntime.runPromise(CmsClient.pipe(Effect.flatMap((cms) => cms.readMenu(name))));
