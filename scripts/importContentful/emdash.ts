import type { UploadedMedia } from "./portableText.ts";

interface EmDashConfig {
	url: string;
	token: string;
}

interface UploadParams {
	bytes: ArrayBuffer;
	filename: string;
	contentType: string;
}

export interface EntryBody {
	slug?: string;
	data: Record<string, unknown>;
	bylines?: Array<{ bylineId: string }>;
	references?: Record<string, string[]>;
	publishedAt?: string;
	createdAt?: string;
}

interface CreateParams {
	collection: string;
	body: EntryBody;
}

interface UpdateParams {
	collection: string;
	id: string;
	references: Record<string, string[]>;
}

interface PublishParams {
	collection: string;
	id: string;
}

export interface BylineBody {
	slug?: string;
	displayName: string;
	bio?: string;
	avatarMediaId?: string;
	customFields: Record<string, unknown>;
}

export interface BylineFieldBody {
	slug: string;
	label: string;
	type: "string" | "text";
	translatable: false;
}

export interface TermBody {
	slug?: string;
	label: string;
}

interface CreateTermParams {
	taxonomy: string;
	body: TermBody;
}

interface SetTermsParams {
	collection: string;
	id: string;
	taxonomy: string;
	termIds: string[];
}

interface CallParams {
	path: string;
	init?: RequestInit;
}

interface JsonParams {
	method: string;
	body: unknown;
}

interface Answer<DATA> {
	success: boolean;
	data?: DATA;
	error?: { code: string; message: string };
}

interface CreatedItem {
	item: { id: string };
}

interface CreatedTerm {
	term: { id: string };
}

interface TermListAnswer {
	terms: unknown[];
}

interface MediaItemAnswer {
	item: UploadedMedia & { storageKey: string };
}

interface ListAnswer {
	items: unknown[];
}

interface BylineFieldListAnswer {
	items: Array<{ slug: string }>;
}

interface CreatedByline {
	id: string;
}

export interface EmDashWriter {
	countEntries(collection: string): Promise<number>;
	countTerms(taxonomy: string): Promise<number>;
	ensureBylineFields(fields: BylineFieldBody[]): Promise<void>;
	createByline(body: BylineBody): Promise<string>;
	createTerm(params: CreateTermParams): Promise<string>;
	setTerms(params: SetTermsParams): Promise<void>;
	uploadMedia(params: UploadParams): Promise<UploadedMedia>;
	create(params: CreateParams): Promise<string>;
	updateReferences(params: UpdateParams): Promise<void>;
	publish(params: PublishParams): Promise<void>;
}

export const TERMS_PER_REQUEST = 30;

export function growingPrefixes<ITEM>(items: ITEM[]): ITEM[][] {
	return Array.from({ length: Math.ceil(items.length / TERMS_PER_REQUEST) }, (_, index) =>
		items.slice(0, (index + 1) * TERMS_PER_REQUEST),
	);
}

export function emdashWriter({ url, token }: EmDashConfig): EmDashWriter {
	const { origin } = new URL(url);

	const call = async <DATA>({ path, init = {} }: CallParams): Promise<DATA> => {
		const response = await fetch(`${origin}/_emdash/api${path}`, {
			...init,
			headers: { Authorization: `Bearer ${token}`, ...init.headers },
		});
		const answer = (await response.json().catch(() => ({ success: false }))) as Answer<DATA>;

		if (!response.ok || !answer.success || answer.data === undefined) {
			throw new Error(
				`EmDash answered ${response.status} to ${init.method ?? "GET"} ${path}: ${answer.error?.message}`,
			);
		}

		return answer.data;
	};

	const json = ({ method, body }: JsonParams): RequestInit => ({
		method,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	return {
		countEntries: async (collection) =>
			(await call<ListAnswer>({ path: `/content/${collection}?limit=1&status=all` })).items.length,
		countTerms: async (taxonomy) =>
			(await call<TermListAnswer>({ path: `/taxonomies/${taxonomy}/terms` })).terms.length,
		ensureBylineFields: async (fields) => {
			const { items } = await call<BylineFieldListAnswer>({ path: "/admin/byline-fields" });
			const registered = new Set(items.map(({ slug }) => slug));

			for (const field of fields.filter(({ slug }) => !registered.has(slug))) {
				await call<unknown>({ path: "/admin/byline-fields", init: json({ method: "POST", body: field }) });
			}
		},
		createByline: async (body) =>
			(await call<CreatedByline>({ path: "/admin/bylines", init: json({ method: "POST", body }) })).id,
		createTerm: async ({ taxonomy, body }) =>
			(await call<CreatedTerm>({ path: `/taxonomies/${taxonomy}/terms`, init: json({ method: "POST", body }) })).term
				.id,
		setTerms: async ({ collection, id, taxonomy, termIds }) => {
			for (const prefix of growingPrefixes(termIds)) {
				await call<unknown>({
					path: `/content/${collection}/${id}/terms/${taxonomy}`,
					init: json({ method: "POST", body: { termIds: prefix } }),
				});
			}
		},
		uploadMedia: async ({ bytes, filename, contentType }) => {
			const form = new FormData();

			form.append("file", new Blob([bytes], { type: contentType }), filename);

			const { item } = await call<MediaItemAnswer>({ path: "/media", init: { method: "POST", body: form } });

			return item;
		},
		create: async ({ collection, body }) =>
			(await call<CreatedItem>({ path: `/content/${collection}`, init: json({ method: "POST", body }) })).item.id,
		updateReferences: async ({ collection, id, references }) => {
			await call<CreatedItem>({
				path: `/content/${collection}/${id}`,
				init: json({ method: "PUT", body: { references } }),
			});
		},
		publish: async ({ collection, id }) => {
			await call<unknown>({ path: `/content/${collection}/${id}/publish`, init: { method: "POST" } });
		},
	};
}
