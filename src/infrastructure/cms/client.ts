import { Context, Effect, Layer } from "effect";
import { CmsError } from "../errors";
import { resolveMedia } from "./media";

export const PUBLISHED_STATUS = "published";

export interface CmsReference {
	id: string;
}

export interface CmsTerm {
	id: string;
	slug: string;
	label: string;
}

export interface CmsItem {
	id: string;
	slug: string | null;
	data: Record<string, unknown>;
	terms: Record<string, CmsTerm[]>;
	updatedAt: string;
}

interface CmsItemPage {
	items: CmsItem[];
	nextCursor?: string;
}

interface CmsReferencePage {
	children: CmsReference[];
	nextCursor?: string;
}

export interface ListEntriesQuery {
	collection: string;
	limit: number;
	cursor?: string;
	orderBy?: string;
	order?: "asc" | "desc";
}

export interface ListReferencesQuery {
	collection: string;
	id: string;
	field: string;
	limit: number;
	cursor?: string;
}

interface QueriedEntry {
	id: string;
	data: unknown;
}

interface Queried {
	entries: QueriedEntry[];
	nextCursor?: string;
	error?: Error;
}

interface QueryParams {
	run: () => Promise<Queried>;
	failure: string;
}

export class CmsClient extends Context.Tag("CmsClient")<
	CmsClient,
	{
		listEntries(query: ListEntriesQuery): Effect.Effect<CmsItemPage, CmsError>;
		listReferences(query: ListReferencesQuery): Effect.Effect<CmsReferencePage, CmsError>;
	}
>() {}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const asText = (value: unknown): string | null => (typeof value === "string" && value ? value : null);

function plain(value: unknown): unknown {
	if (value instanceof Date) return value.toISOString();
	if (Array.isArray(value)) return value.map(plain);
	if (!isRecord(value)) return value;

	return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, plain(entry)]));
}

function termsOf(value: unknown): Record<string, CmsTerm[]> {
	if (!isRecord(value)) return {};

	return Object.fromEntries(
		Object.entries(value).map(([taxonomy, terms]) => [
			taxonomy,
			(Array.isArray(terms) ? terms : []).flatMap((term) => {
				const id = isRecord(term) ? asText(term.id) : null;
				const slug = isRecord(term) ? asText(term.slug) : null;

				return id && slug ? [{ id, slug, label: asText(term.label) ?? slug }] : [];
			}),
		]),
	);
}

export function itemOf({ data }: QueriedEntry): CmsItem | undefined {
	const record = plain(data);

	if (!isRecord(record)) return undefined;

	const { terms, ...fields } = record;
	const id = asText(fields.id);

	if (!id) return undefined;

	return {
		id,
		slug: asText(fields.slug),
		data: resolveMedia(fields),
		terms: termsOf(terms),
		updatedAt: asText(fields.updatedAt) ?? "",
	};
}

const query = ({ run, failure }: QueryParams) =>
	Effect.tryPromise({
		try: run,
		catch: (cause) =>
			new CmsError({ message: `${failure}: ${cause instanceof Error ? cause.message : String(cause)}`, cause }),
	}).pipe(
		Effect.flatMap(({ error, ...result }) =>
			error
				? Effect.fail(new CmsError({ message: `${failure}: ${error.message}`, cause: error }))
				: Effect.succeed(result),
		),
	);

export const CmsClientLive = Layer.effect(
	CmsClient,
	Effect.promise(() => import("emdash")).pipe(
		Effect.map((emdash) => ({
			listEntries: ({ collection, limit, cursor, orderBy, order }: ListEntriesQuery) =>
				query({
					run: () =>
						emdash.getEmDashCollection(collection, {
							status: PUBLISHED_STATUS,
							limit,
							cursor,
							...(orderBy && { orderBy: { [orderBy]: order ?? "asc" } }),
						}),
					failure: `The ${collection} collection could not be read`,
				}).pipe(
					Effect.map(({ entries, nextCursor }) => ({
						items: entries.flatMap((entry) => itemOf(entry) ?? []),
						...(nextCursor && { nextCursor }),
					})),
				),
			listReferences: ({ collection, id, field, limit, cursor }: ListReferencesQuery) =>
				query({
					run: () => emdash.getEmDashReferences(collection, id, field, { limit, cursor }),
					failure: `The ${field} references of ${collection} ${id} could not be read`,
				}).pipe(
					Effect.map(({ entries, nextCursor }) => ({
						children: entries.flatMap((entry) => {
							const child = itemOf(entry);

							return child ? [{ id: child.id }] : [];
						}),
						...(nextCursor && { nextCursor }),
					})),
				),
		})),
	),
);
