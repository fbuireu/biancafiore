export interface ContentfulLink {
	sys: { type: "Link"; linkType: "Entry" | "Asset"; id: string };
}

export interface ContentfulEntry {
	sys: { id: string; createdAt: string; updatedAt: string; contentType: { sys: { id: string } } };
	fields: Record<string, unknown>;
}

export interface ContentfulAsset {
	sys: { id: string };
	fields: {
		title?: string;
		description?: string;
		file?: {
			url: string;
			contentType: string;
			fileName: string;
			details?: { image?: { width: number; height: number } };
		};
	};
}

export interface ContentfulSpace {
	entries: ContentfulEntry[];
	assets: ContentfulAsset[];
}

interface ContentfulConfig {
	space: string;
	token: string;
	environment: string;
}

interface EveryPageParams {
	config: ContentfulConfig;
	resource: string;
}

interface Page<ITEM> {
	items: ITEM[];
	total: number;
}

const DELIVERY_API = "https://cdn.contentful.com";
const PAGE_SIZE = 1000;

export function isLink(value: unknown): value is ContentfulLink {
	return typeof value === "object" && value !== null && "sys" in value && (value as ContentfulLink).sys.type === "Link";
}

export function linkedId(value: unknown): string | undefined {
	return isLink(value) ? value.sys.id : undefined;
}

export function contentTypeOf(entry: ContentfulEntry): string {
	return entry.sys.contentType.sys.id;
}

async function everyPage<ITEM>({ config, resource }: EveryPageParams): Promise<ITEM[]> {
	const { space, token, environment } = config;
	const items: ITEM[] = [];

	for (let skip = 0; ; skip += PAGE_SIZE) {
		const url = `${DELIVERY_API}/spaces/${space}/environments/${environment}/${resource}?limit=${PAGE_SIZE}&skip=${skip}&include=0`;
		const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

		if (!response.ok) {
			throw new Error(`Contentful answered ${response.status} for ${resource}: ${await response.text()}`);
		}

		const page = (await response.json()) as Page<ITEM>;

		items.push(...page.items);

		if (page.items.length === 0 || items.length >= page.total) return items;
	}
}

export async function readSpace(config: ContentfulConfig): Promise<ContentfulSpace> {
	const [entries, assets] = await Promise.all([
		everyPage<ContentfulEntry>({ config, resource: "entries" }),
		everyPage<ContentfulAsset>({ config, resource: "assets" }),
	]);

	return { entries, assets };
}
