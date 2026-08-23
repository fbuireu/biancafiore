import { CmsClient, CmsClientLive, type EntriesQuery, isContentfulConfigured } from "@infrastructure/cms/client";
import type { EntryCollection, EntrySkeletonType } from "contentful";
import { type Context, Effect, ManagedRuntime } from "effect";

type RawEntries<Skeletons extends readonly EntrySkeletonType[]> = {
	[Index in keyof Skeletons]: EntryCollection<Skeletons[Index], undefined>["items"];
};

type PagedQuery = NonNullable<EntriesQuery> & { skip?: number; limit?: number };

type RawEntry = EntryCollection<EntrySkeletonType, undefined>["items"][number];

const CONTENTFUL_MAX_PAGE_SIZE = 1000;

interface FetchEveryPageParams {
	cms: Context.Tag.Service<CmsClient>;
	query: PagedQuery;
}

const cmsRuntime = ManagedRuntime.make(CmsClientLive);

const fetchEveryPage = ({ cms, query }: FetchEveryPageParams) =>
	Effect.gen(function* () {
		const wanted = query.limit;
		const start = query.skip ?? 0;
		const items: RawEntry[] = [];

		while (wanted === undefined || items.length < wanted) {
			const remaining = wanted === undefined ? CONTENTFUL_MAX_PAGE_SIZE : wanted - items.length;
			const collection = yield* cms.getEntries({
				...query,
				skip: start + items.length,
				limit: Math.min(remaining, CONTENTFUL_MAX_PAGE_SIZE),
			});

			items.push(...collection.items);

			if (collection.items.length === 0 || start + items.length >= collection.total) break;
		}

		return items;
	});

export const fetchEntries = <Skeletons extends readonly EntrySkeletonType[]>(
	...queries: { [Index in keyof Skeletons]: EntriesQuery }
): Promise<RawEntries<Skeletons>> => {
	if (!isContentfulConfigured()) return Promise.resolve(queries.map(() => []) as RawEntries<Skeletons>);

	return cmsRuntime.runPromise(
		Effect.gen(function* () {
			const cms = yield* CmsClient;
			const collections = yield* Effect.all(
				queries.map((query) => fetchEveryPage({ cms, query: query as PagedQuery })),
				{ concurrency: "unbounded" },
			);

			return collections as RawEntries<Skeletons>;
		}),
	);
};
