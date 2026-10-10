import type {
	CmsClient,
	CmsMenuItem,
	CmsReference,
	CmsSiteSettings,
	ListEntriesQuery,
	ListReferencesQuery,
	ReadEntryQuery,
} from "@infrastructure/cms/client";
import type { CmsError } from "@infrastructure/errors";
import { Effect, Layer } from "effect";

type CmsTag = typeof import("@infrastructure/cms/client").CmsClient;

interface ReferenceKeyParams {
	collection: string;
	id: string;
	field: string;
}

interface CmsRefersToParams extends ReferenceKeyParams {
	references: CmsReference[];
}

interface PageOfParams<ITEM> {
	all: ITEM[];
	cursor?: string;
	limit: number;
}

const OVERLAP_DEADLINE = 1000;
const EMPTY_SITE_SETTINGS: CmsSiteSettings = {
	title: null,
	tagline: null,
	social: {},
	titleSeparator: null,
};
const UNLIMITED_PAGE = Number.POSITIVE_INFINITY;

export const cmsQueries: ListEntriesQuery[] = [];
export const cmsReferenceQueries: ListReferencesQuery[] = [];
export const cmsEntryQueries: ReadEntryQuery[] = [];

let entriesByCollection: Record<string, unknown[]> = {};
let referencesByEntry: Record<string, CmsReference[]> = {};
let previewedByCollection: Record<string, unknown[]> = {};
let siteSettings: CmsSiteSettings = EMPTY_SITE_SETTINGS;
let menus: Record<string, CmsMenuItem[]> = {};
let pageSize = UNLIMITED_PAGE;
let failure: CmsError | undefined;
let held = 0;
let overlapped = false;
let opened: Promise<void> = Promise.resolve();
let open: (() => void) | undefined;
let deadline: ReturnType<typeof setTimeout> | undefined;

interface IsEntryNamedParams {
	candidate: unknown;
	id: string;
}

function isEntryNamed({ candidate, id }: IsEntryNamedParams): boolean {
	if (typeof candidate !== "object" || candidate === null) return false;

	const { id: entryId, slug } = candidate as { id?: unknown; slug?: unknown };

	return entryId === id || slug === id;
}

function referenceKey({ collection, id, field }: ReferenceKeyParams): string {
	return `${collection}/${id}/${field}`;
}

function pageOf<ITEM>({ all, cursor, limit }: PageOfParams<ITEM>): { page: ITEM[]; nextCursor?: string } {
	const start = Number(cursor ?? 0);
	const end = start + Math.min(limit, pageSize);
	const page = all.slice(start, end);

	return { page, ...(end < all.length && { nextCursor: String(end) }) };
}

export function cmsAnswers(entries: Record<string, unknown[]>): void {
	entriesByCollection = entries;
}

export function cmsPreviews(entries: Record<string, unknown[]>): void {
	previewedByCollection = entries;
}

export function cmsRefersTo(params: CmsRefersToParams): void {
	referencesByEntry[referenceKey(params)] = params.references;
}

export function cmsSiteSettings(settings: Partial<CmsSiteSettings>): void {
	siteSettings = { ...EMPTY_SITE_SETTINGS, ...settings };
}

export function cmsMenus(byName: Record<string, CmsMenuItem[]>): void {
	menus = byName;
}

export function cmsServesPagesOf(size: number): void {
	pageSize = size;
}

export function cmsFailsWith(error: CmsError): void {
	failure = error;
}

export function cmsHoldsUntilQueries(count: number): void {
	held = count;
	overlapped = false;
	opened = new Promise<void>((resolve) => {
		deadline = setTimeout(() => {
			open = undefined;
			resolve();
		}, OVERLAP_DEADLINE);

		open = () => {
			overlapped = true;
			clearTimeout(deadline);
			resolve();
		};
	});
}

export function cmsQueriesOverlapped(): boolean {
	return overlapped;
}

export function resetCms(): void {
	clearTimeout(deadline);
	cmsQueries.length = 0;
	cmsReferenceQueries.length = 0;
	cmsEntryQueries.length = 0;
	entriesByCollection = {};
	referencesByEntry = {};
	previewedByCollection = {};
	siteSettings = EMPTY_SITE_SETTINGS;
	menus = {};
	pageSize = UNLIMITED_PAGE;
	failure = undefined;
	held = 0;
	overlapped = false;
	opened = Promise.resolve();
	open = undefined;
}

export function cmsClientLayer(tag: CmsTag): Layer.Layer<CmsClient> {
	return Layer.succeed(tag, {
		listEntries: (query: ListEntriesQuery) =>
			Effect.suspend(() => {
				cmsQueries.push(query);

				if (held > 0 && cmsQueries.length >= held) open?.();

				const { page, nextCursor } = pageOf({
					all: entriesByCollection[query.collection] ?? [],
					cursor: query.cursor,
					limit: query.limit,
				});
				const answer = failure ? Effect.fail(failure) : Effect.succeed({ items: page, nextCursor });

				return held > 0 ? Effect.promise(() => opened).pipe(Effect.andThen(answer)) : answer;
			}),
		readEntry: (query: ReadEntryQuery) =>
			Effect.suspend(() => {
				cmsEntryQueries.push(query);

				const entry = (previewedByCollection[query.collection] ?? []).find((candidate) =>
					isEntryNamed({ candidate, id: query.id }),
				);

				return failure ? Effect.fail(failure) : Effect.succeed(entry);
			}),
		listReferences: (query: ListReferencesQuery) =>
			Effect.suspend(() => {
				cmsReferenceQueries.push(query);

				const { page, nextCursor } = pageOf({
					all: referencesByEntry[referenceKey(query)] ?? [],
					cursor: query.cursor,
					limit: query.limit,
				});

				return failure ? Effect.fail(failure) : Effect.succeed({ children: page, nextCursor });
			}),
		readSiteSettings: () => Effect.suspend(() => (failure ? Effect.fail(failure) : Effect.succeed(siteSettings))),
		readMenu: (name: string) => Effect.suspend(() => (failure ? Effect.fail(failure) : Effect.succeed(menus[name]))),
	} as never);
}
