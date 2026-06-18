/**
 * One-off migration: Contentful -> EmDash.
 *
 * Reads every entry/asset from the Contentful Content Delivery API (plain REST,
 * no SDK dependency), converts Contentful Rich Text to Portable Text, uploads
 * assets to EmDash media, and creates the equivalent entries through the EmDash
 * REST API.
 *
 * Run with:  pnpm cms:migrate
 *
 * Required env (see .env.example):
 *   MIGRATION_CONTENTFUL_SPACE_ID
 *   MIGRATION_CONTENTFUL_DELIVERY_TOKEN
 *   EMDASH_API_URL        e.g. http://localhost:4321 (dev) or https://biancafiore.me
 *   EMDASH_API_TOKEN      bearer token generated in the EmDash admin
 *
 * IMPORTANT: collections must already exist in EmDash (create them in the admin
 * UI, or via `emdash schema create`) with the field names used below. This is an
 * idempotency-free, best-effort importer — review the output and re-run against a
 * clean database. EmDash is pre-1.0; verify the media upload + reference flows
 * against your installed version before trusting a full run.
 */

import { Buffer } from "node:buffer";
import process from "node:process";

interface ContentfulSys {
	id: string;
	updatedAt?: string;
	contentType?: { sys: { id: string } };
}
interface ContentfulEntry {
	sys: ContentfulSys;
	fields: Record<string, unknown>;
}
interface ContentfulAsset {
	sys: ContentfulSys;
	fields: {
		title?: string;
		description?: string;
		file: {
			url: string;
			contentType: string;
			fileName: string;
			details: { size: number; image?: { width: number; height: number } };
		};
	};
}
interface ContentfulResponse {
	items: ContentfulEntry[];
	includes?: { Entry?: ContentfulEntry[]; Asset?: ContentfulAsset[] };
}

interface RichTextNode {
	nodeType: string;
	value?: string;
	marks?: Array<{ type: string }>;
	content?: RichTextNode[];
	data?: { uri?: string; target?: { sys?: { id?: string } } };
}
interface PortableTextSpan {
	_type: "span";
	text: string;
	marks: string[];
}
interface PortableTextMarkDef {
	_key: string;
	_type: string;
	[key: string]: unknown;
}
type PortableTextBlock = Record<string, unknown>;

interface Includes {
	entries: Map<string, ContentfulEntry>;
	assets: Map<string, ContentfulAsset>;
}

const SPACE = requireEnv("MIGRATION_CONTENTFUL_SPACE_ID");
const CDA_TOKEN = requireEnv("MIGRATION_CONTENTFUL_DELIVERY_TOKEN");
const EMDASH_URL = requireEnv("EMDASH_API_URL").replace(/\/$/, "");
const EMDASH_TOKEN = requireEnv("EMDASH_API_TOKEN");
const CDA_BASE = `https://cdn.contentful.com/spaces/${SPACE}/environments/master`;

function requireEnv(key: string): string {
	const value = process.env[key];
	if (!value) {
		console.error(`Missing required env var: ${key}`);
		process.exit(1);
	}
	return value;
}

// --- narrowing helpers (no `any`) -----------------------------------------

function asRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}
function str(value: unknown): string {
	return typeof value === "string" ? value : "";
}
function arr(value: unknown): unknown[] {
	return Array.isArray(value) ? value : [];
}
function sysId(value: unknown): string {
	return str(asRecord(asRecord(value).sys).id);
}

// --- Contentful read -------------------------------------------------------

async function fetchContentful(contentType: string): Promise<ContentfulResponse> {
	const params = new URLSearchParams({
		access_token: CDA_TOKEN,
		content_type: contentType,
		include: "3",
		limit: "1000",
	});
	const response = await fetch(`${CDA_BASE}/entries?${params}`);
	if (!response.ok) throw new Error(`Contentful ${contentType}: ${response.status} ${await response.text()}`);
	return response.json() as Promise<ContentfulResponse>;
}

function indexIncludes(response: ContentfulResponse) {
	const entries = new Map((response.includes?.Entry ?? []).map((entry) => [entry.sys.id, entry]));
	const assets = new Map((response.includes?.Asset ?? []).map((asset) => [asset.sys.id, asset]));
	return { entries, assets };
}

// --- Rich Text -> Portable Text -------------------------------------------

const MARK_MAP: Record<string, string> = { bold: "strong", italic: "em", underline: "underline", code: "code" };
const DECORATORS = (node: RichTextNode): string[] => (node.marks ?? []).map((mark) => MARK_MAP[mark.type] ?? mark.type);

function richTextToPortableText(document: unknown, includes: Includes): PortableTextBlock[] {
	const content = asRecord(document).content;
	if (!Array.isArray(content)) return [];
	return (content as RichTextNode[])
		.flatMap((node) => nodeToBlocks(node, includes))
		.filter((block): block is PortableTextBlock => block !== null);
}

/** Builds Portable Text spans + markDefs from inline nodes, preserving links. */
function buildInline(content: RichTextNode[] | undefined): {
	children: PortableTextSpan[];
	markDefs: PortableTextMarkDef[];
} {
	const children: PortableTextSpan[] = [];
	const markDefs: PortableTextMarkDef[] = [];

	for (const node of content ?? []) {
		if (node.nodeType === "text") {
			children.push({ _type: "span", text: node.value ?? "", marks: DECORATORS(node) });
			continue;
		}

		if (node.nodeType === "hyperlink") {
			const key = `link-${markDefs.length}`;
			markDefs.push({ _key: key, _type: "link", href: str(node.data?.uri) });
			for (const child of node.content ?? []) {
				if (child.nodeType === "text")
					children.push({ _type: "span", text: child.value ?? "", marks: [...DECORATORS(child), key] });
			}
			continue;
		}

		// entry/asset hyperlinks resolve to slugs we don't track here: keep the text.
		for (const child of node.content ?? []) {
			if (child.nodeType === "text")
				children.push({ _type: "span", text: child.value ?? "", marks: DECORATORS(child) });
		}
	}

	return { children, markDefs };
}

function block(style: string, content: RichTextNode[] | undefined): PortableTextBlock {
	return { _type: "block", style, ...buildInline(content) };
}

function flattenParagraphInlines(content: RichTextNode[] | undefined): RichTextNode[] {
	return (content ?? []).flatMap((paragraph) => paragraph.content ?? []);
}

function imageBlock(
	asset: ContentfulAsset | undefined,
	extra: { caption?: string; fullBleed?: boolean } = {},
): PortableTextBlock | null {
	if (!asset) return null;
	const { url, details } = asset.fields.file;
	return {
		_type: "image",
		url: `https:${url}`,
		width: details.image?.width,
		height: details.image?.height,
		alt: extra.caption || asset.fields.description || asset.fields.title || "",
		...(extra.caption ? { caption: extra.caption } : {}),
		...(extra.fullBleed ? { fullBleed: true } : {}),
	};
}

/** Maps a Contentful embedded entry to the Portable Text custom type the renderer expects. */
function embeddedEntryBlock(node: RichTextNode, includes: Includes): PortableTextBlock | null {
	const target = includes.entries.get(str(node.data?.target?.sys?.id));
	if (!target) return null;
	const fields = target.fields;

	switch (target.sys.contentType?.sys.id) {
		case "codeBlock":
			return { _type: "code", code: str(fields.code) };
		case "videoEmbed":
			return { _type: "videoEmbed", url: str(fields.url), title: str(fields.title) };
		case "iframeEmbed":
			return { _type: "iframeEmbed", url: str(fields.url), title: str(fields.title) };
		case "imageEmbed":
			return imageBlock(includes.assets.get(sysId(fields.image)), {
				caption: str(fields.caption),
				fullBleed: Boolean(fields.fullBleed),
			});
		default:
			return null;
	}
}

function nodeToBlocks(node: RichTextNode, includes: Includes): PortableTextBlock | PortableTextBlock[] | null {
	switch (node.nodeType) {
		case "paragraph":
			return block("normal", node.content);
		case "heading-1":
		case "heading-2":
		case "heading-3":
		case "heading-4":
		case "heading-5":
		case "heading-6":
			return block(`h${node.nodeType.slice(-1)}`, node.content);
		case "blockquote":
			return block("blockquote", flattenParagraphInlines(node.content));
		case "unordered-list":
		case "ordered-list":
			return (node.content ?? []).map((item) => ({
				...block("normal", flattenParagraphInlines(item.content)),
				listItem: node.nodeType === "ordered-list" ? "number" : "bullet",
				level: 1,
			}));
		case "embedded-asset-block":
			return imageBlock(includes.assets.get(str(node.data?.target?.sys?.id)));
		case "embedded-entry-block":
		case "embedded-entry-inline":
			return embeddedEntryBlock(node, includes);
		default:
			return node.content ? block("normal", node.content) : null;
	}
}

// --- EmDash write ----------------------------------------------------------

async function emdash(path: string, init: RequestInit = {}): Promise<Record<string, unknown>> {
	const response = await fetch(`${EMDASH_URL}/_emdash/api${path}`, {
		...init,
		headers: { Authorization: `Bearer ${EMDASH_TOKEN}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
	});
	const body = asRecord(await response.json());
	if (!response.ok || body.success !== true) {
		throw new Error(`EmDash ${path}: ${response.status} ${str(asRecord(body.error).message)}`);
	}
	return asRecord(body.data);
}

interface MigratedImage {
	id: string;
	url: string;
	width?: number;
	height?: number;
	alt: string;
}

async function migrateAsset(asset: ContentfulAsset): Promise<MigratedImage> {
	const { url, fileName, contentType, details } = asset.fields.file;
	const bytes = Buffer.from(await (await fetch(`https:${url}`)).arrayBuffer());
	// EmDash records media metadata then stores the bytes; exact upload mechanics
	// (signed URL vs multipart) depend on your storage adapter — adapt if needed.
	const media = await emdash("/media", {
		method: "POST",
		body: JSON.stringify({
			filename: fileName,
			mimeType: contentType,
			size: details.size,
			width: details.image?.width,
			height: details.image?.height,
			data: bytes.toString("base64"),
		}),
	});
	return {
		id: str(media.id),
		url: str(media.url),
		width: details.image?.width,
		height: details.image?.height,
		alt: asset.fields.description ?? asset.fields.title ?? "",
	};
}

async function createEntry(collection: string, data: Record<string, unknown>, slug: string): Promise<string> {
	const created = await emdash(`/content/${collection}`, {
		method: "POST",
		body: JSON.stringify({ data, slug, status: "published" }),
	});
	return str(created.id);
}

/**
 * Attaches taxonomy term slugs to an entry. In EmDash tags are a taxonomy, not a
 * reference field. The terms must already exist (create them in the admin or via
 * `emdash taxonomy add-term`); depending on your version this endpoint may expect
 * term ids rather than slugs — adjust if a run reports unknown terms.
 *
 * @see https://docs.emdashcms.com/guides/taxonomies/
 */
async function attachTerms(collection: string, entryId: string, taxonomy: string, termSlugs: string[]): Promise<void> {
	if (termSlugs.length === 0) return;
	await emdash(`/content/${collection}/${entryId}/terms/${taxonomy}`, {
		method: "POST",
		body: JSON.stringify({ termIds: termSlugs }),
	});
}

// --- Orchestration ---------------------------------------------------------

const links = (field: unknown): string[] => arr(field).map(sysId).filter(Boolean);

const SIMPLE_COLLECTIONS: Record<string, string> = { city: "cities", project: "projects", testimonial: "testimonials" };

async function migrate() {
	const idMap = {
		authors: new Map<string, string>(),
		articles: new Map<string, string>(),
	};

	console.log("→ authors");
	const authors = await fetchContentful("author");
	const authorAssets = indexIncludes(authors).assets;
	for (const author of authors.items) {
		const image = authorAssets.get(sysId(author.fields.profileImage));
		const profileImage = image ? await migrateAsset(image) : undefined;
		const id = await createEntry("authors", { ...author.fields, profileImage }, str(author.fields.slug));
		idMap.authors.set(author.sys.id, id);
	}

	// Tags are an EmDash taxonomy (not a collection). We only need a Contentful
	// id → term slug map here; the terms themselves must exist in the `tag`
	// taxonomy (create them in the admin or via `emdash taxonomy add-term`).
	console.log("→ tags (taxonomy term slugs)");
	const tags = await fetchContentful("tag");
	const tagSlugById = new Map<string, string>(tags.items.map((tag) => [tag.sys.id, str(tag.fields.slug)]));

	for (const [contentType, collection] of Object.entries(SIMPLE_COLLECTIONS)) {
		console.log(`→ ${contentType}`);
		const response = await fetchContentful(contentType);
		const includes = indexIncludes(response);
		for (const entry of response.items) {
			const fields = entry.fields;
			const image = includes.assets.get(sysId(fields.image));
			const migratedImage = image ? await migrateAsset(image) : undefined;
			const data: Record<string, unknown> = { ...fields, ...(migratedImage ? { image: migratedImage } : {}) };
			if (contentType === "project" && fields.description)
				data.description = richTextToPortableText(fields.description, includes);
			await createEntry(collection, data, str(fields.slug) || str(fields.name) || str(fields.author));
		}
	}

	console.log("→ articles (pass 1: create)");
	const articles = await fetchContentful("article");
	const includes = indexIncludes(articles);
	for (const article of articles.items) {
		const fields = article.fields;
		const featured = includes.assets.get(sysId(fields.featuredImage));
		const featuredImage = featured ? await migrateAsset(featured) : undefined;
		const id = await createEntry(
			"articles",
			{
				title: str(fields.title),
				description: str(fields.description),
				content: richTextToPortableText(fields.content, includes),
				publishDate: fields.publishDate,
				updatedAt: article.sys.updatedAt,
				featuredImage,
				featuredArticle: Boolean(fields.featuredArticle),
				isRepublished: Boolean(fields.isRepublished),
				originalSource: fields.originalSource,
				author: idMap.authors.get(sysId(fields.author)),
			},
			str(fields.slug),
		);
		idMap.articles.set(article.sys.id, id);

		const tagSlugs = links(fields.tags)
			.map((cfId) => tagSlugById.get(cfId))
			.filter((value): value is string => Boolean(value));
		await attachTerms("articles", id, "tag", tagSlugs);
	}

	console.log("→ articles (pass 2: relatedArticles)");
	for (const article of articles.items) {
		const related = links(article.fields.relatedArticles)
			.map((cfId) => idMap.articles.get(cfId))
			.filter((value): value is string => Boolean(value));
		if (!related.length) continue;
		const id = idMap.articles.get(article.sys.id);
		if (!id) continue;
		await emdash(`/content/articles/${id}`, {
			method: "PUT",
			body: JSON.stringify({ data: { relatedArticles: related } }),
		});
	}

	console.log("✓ migration complete");
}

migrate().catch((error) => {
	console.error(error);
	process.exit(1);
});
