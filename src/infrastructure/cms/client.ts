import { Context, Effect, Layer } from "effect";
import { CmsError } from "../errors";
import { mediaFileUrl, resolveMedia } from "./media";

export const PUBLISHED_STATUS = "published";

export interface CmsReference {
	id: string;
}

export interface CmsTerm {
	id: string;
	slug: string;
	label: string;
}

export interface CmsMedia {
	id: string;
	src: string;
	alt?: string;
	width?: number;
	height?: number;
	mimeType?: string;
	blurhash?: string;
}

export interface CmsByline {
	id: string;
	slug: string | null;
	displayName: string;
	bio: string | null;
	avatar?: CmsMedia;
	customFields: Record<string, unknown>;
}

export interface CmsItem {
	id: string;
	slug: string | null;
	data: Record<string, unknown>;
	terms: Record<string, CmsTerm[]>;
	bylines: CmsByline[];
	updatedAt: string;
}

export interface CmsSiteImage {
	src: string;
	width?: number;
	height?: number;
}

export interface CmsSiteSettings {
	title: string | null;
	tagline: string | null;
	social: Record<string, string>;
	titleSeparator: string | null;
	defaultOgImage?: CmsSiteImage;
}

export interface CmsMenuItem {
	label: string;
	url: string;
	target: string | null;
	children: CmsMenuItem[];
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

interface BylinesOfParams {
	credits: unknown;
	avatars: ReadonlyMap<string, CmsMedia>;
}

interface ItemOfParams {
	entry: QueriedEntry;
	avatars?: ReadonlyMap<string, CmsMedia>;
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
		readSiteSettings(): Effect.Effect<CmsSiteSettings, CmsError>;
		readMenu(name: string): Effect.Effect<CmsMenuItem[] | undefined, CmsError>;
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

const HYDRATED_KEYS = new Set(["terms", "bylines", "byline"]);

const creditsOf = (value: unknown): Record<string, unknown>[] =>
	(Array.isArray(value) ? value : [])
		.filter(isRecord)
		.toSorted((first, second) => Number(first.sortOrder ?? 0) - Number(second.sortOrder ?? 0));

function avatarIdsOf(entries: QueriedEntry[]): string[] {
	const ids = entries.flatMap(({ data }) =>
		isRecord(data)
			? creditsOf(data.bylines).flatMap(({ byline }) => (isRecord(byline) ? (asText(byline.avatarMediaId) ?? []) : []))
			: [],
	);

	return [...new Set(ids)];
}

function bylinesOf({ credits, avatars }: BylinesOfParams): CmsByline[] {
	return creditsOf(credits).flatMap(({ byline }) => {
		if (!isRecord(byline)) return [];

		const id = asText(byline.id);
		const avatarId = asText(byline.avatarMediaId);
		const avatar = avatarId ? avatars.get(avatarId) : undefined;

		return id
			? [
					{
						id,
						slug: asText(byline.slug),
						displayName: typeof byline.displayName === "string" ? byline.displayName : "",
						bio: asText(byline.bio),
						...(avatar && { avatar }),
						customFields: isRecord(byline.customFields) ? byline.customFields : {},
					},
				]
			: [];
	});
}

const numberOf = (value: unknown): number | undefined => (typeof value === "number" ? value : undefined);

function mediaOf(item: Record<string, unknown>): CmsMedia | undefined {
	const id = asText(item.id);
	const storageKey = asText(item.storageKey);

	return id && storageKey
		? {
				id,
				src: mediaFileUrl(storageKey),
				alt: asText(item.alt) ?? undefined,
				width: numberOf(item.width),
				height: numberOf(item.height),
				mimeType: asText(item.mimeType) ?? undefined,
				blurhash: asText(item.blurhash) ?? undefined,
			}
		: undefined;
}

export function itemOf({ entry, avatars = new Map() }: ItemOfParams): CmsItem | undefined {
	const record = plain(entry.data);

	if (!isRecord(record)) return undefined;

	const fields = Object.fromEntries(Object.entries(record).filter(([key]) => !HYDRATED_KEYS.has(key)));
	const id = asText(fields.id);

	if (!id) return undefined;

	return {
		id,
		slug: asText(fields.slug),
		data: resolveMedia(fields),
		terms: termsOf(record.terms),
		bylines: bylinesOf({ credits: record.bylines, avatars }),
		updatedAt: asText(fields.updatedAt) ?? "",
	};
}

function siteImageOf(value: unknown): CmsSiteImage | undefined {
	if (!isRecord(value)) return undefined;

	const src = asText(value.url);

	return src ? { src, width: numberOf(value.width), height: numberOf(value.height) } : undefined;
}

export function siteSettingsOf(value: unknown): CmsSiteSettings {
	const settings = isRecord(value) ? value : {};
	const seo = isRecord(settings.seo) ? settings.seo : {};
	const social = isRecord(settings.social) ? settings.social : {};
	const defaultOgImage = siteImageOf(seo.defaultOgImage);

	return {
		title: asText(settings.title),
		tagline: asText(settings.tagline),
		social: Object.fromEntries(
			Object.entries(social).flatMap(([network, value]) => {
				const url = asText(value);

				return url ? [[network, url] as const] : [];
			}),
		),
		titleSeparator: typeof seo.titleSeparator === "string" && seo.titleSeparator ? seo.titleSeparator : null,
		...(defaultOgImage && { defaultOgImage }),
	};
}

export function menuItemsOf(value: unknown): CmsMenuItem[] {
	return (Array.isArray(value) ? value : []).flatMap((item) => {
		if (!isRecord(item)) return [];

		const label = asText(item.label);
		const url = asText(item.url);

		return label && url ? [{ label, url, target: asText(item.target), children: menuItemsOf(item.children) }] : [];
	});
}

interface AttemptParams<VALUE> {
	run: () => Promise<VALUE>;
	failure: string;
}

const attempt = <VALUE>({ run, failure }: AttemptParams<VALUE>) =>
	Effect.tryPromise({
		try: run,
		catch: (cause) =>
			new CmsError({ message: `${failure}: ${cause instanceof Error ? cause.message : String(cause)}`, cause }),
	});

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

const loadEmDash = () => Promise.all([import("emdash"), import("emdash/runtime")]);

export const CmsClientLive = Layer.effect(
	CmsClient,
	Effect.promise(loadEmDash).pipe(
		Effect.map(([emdash, runtime]) => {
			const avatarsOf = (entries: QueriedEntry[]) =>
				query({
					run: async () => {
						const ids = avatarIdsOf(entries);

						if (ids.length === 0) return { entries: [] };

						const media = new emdash.MediaRepository(await runtime.getDb());
						const found = await Promise.all(ids.map((id) => media.findById(id)));

						return { entries: found.flatMap((item) => (item ? [{ id: item.id, data: item }] : [])) };
					},
					failure: "The byline avatars could not be read",
				}).pipe(
					Effect.map(
						({ entries: items }) =>
							new Map(
								items.flatMap(({ data }) => {
									const media = isRecord(data) ? mediaOf(data) : undefined;

									return media ? [[media.id, media] as const] : [];
								}),
							),
					),
				);

			return {
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
						Effect.flatMap(({ entries, nextCursor }) =>
							avatarsOf(entries).pipe(
								Effect.map((avatars) => ({
									items: entries.flatMap((entry) => itemOf({ entry, avatars }) ?? []),
									...(nextCursor && { nextCursor }),
								})),
							),
						),
					),
				listReferences: ({ collection, id, field, limit, cursor }: ListReferencesQuery) =>
					query({
						run: () => emdash.getEmDashReferences(collection, id, field, { limit, cursor }),
						failure: `The ${field} references of ${collection} ${id} could not be read`,
					}).pipe(
						Effect.map(({ entries, nextCursor }) => ({
							children: entries.flatMap((entry) => {
								const child = itemOf({ entry });

								return child ? [{ id: child.id }] : [];
							}),
							...(nextCursor && { nextCursor }),
						})),
					),
				readSiteSettings: () =>
					attempt({ run: () => emdash.getSiteSettings(), failure: "The site settings could not be read" }).pipe(
						Effect.map((settings) => siteSettingsOf(plain(settings))),
					),
				readMenu: (name: string) =>
					attempt({ run: () => emdash.getMenu(name), failure: `The ${name} menu could not be read` }).pipe(
						Effect.map((menu) => (menu ? menuItemsOf(plain(menu.items)) : undefined)),
					),
			};
		}),
	),
);
