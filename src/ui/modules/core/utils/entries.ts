import { getLiveCollection, getLiveEntry } from "astro:content";
import { SITE_AUTHOR_SLUG } from "@const/const";
import type { MenuName } from "@domain/menu";
import type { Reference } from "@domain/shared/reference";
import { SITE_SETTINGS_ID } from "@domain/site";

const ENTRY_NOT_FOUND = "LiveEntryNotFoundError";

interface LiveResult<ENTRY> {
	entries?: ENTRY[];
	entry?: ENTRY;
	error?: Error;
}

function unwrap<ENTRY>({ error, ...result }: LiveResult<ENTRY>): LiveResult<ENTRY> {
	if (error) throw error;

	return result;
}

const entriesOf = <ENTRY>(result: LiveResult<ENTRY>): ENTRY[] => unwrap(result).entries ?? [];

const entryOf = <ENTRY>(result: LiveResult<ENTRY>): ENTRY | undefined =>
	result.error?.name === ENTRY_NOT_FOUND ? undefined : unwrap(result).entry;

export const readArticles = async () => entriesOf(await getLiveCollection("articles"));
export const readArticle = async (slug: string) => entryOf(await getLiveEntry("articles", slug));
export const readAuthors = async () => entriesOf(await getLiveCollection("authors"));
export const readCities = async () => entriesOf(await getLiveCollection("cities"));
export const readProjects = async () => entriesOf(await getLiveCollection("projects"));
export const readTags = async () => entriesOf(await getLiveCollection("tags"));
export const readTag = async (slug: string) => entryOf(await getLiveEntry("tags", slug));
export const readTestimonials = async () => entriesOf(await getLiveCollection("testimonials"));

export type ArticleEntry = Awaited<ReturnType<typeof readArticles>>[number];
type AuthorEntry = Awaited<ReturnType<typeof readAuthors>>[number];
export type CityEntry = Awaited<ReturnType<typeof readCities>>[number];
export type TestimonialEntry = Awaited<ReturnType<typeof readTestimonials>>[number];

interface ResolveArticlesParams {
	references: Reference<"articles">[];
	articles: ArticleEntry[];
}

interface ResolveArticleParams {
	reference?: Reference<"articles">;
	articles: ArticleEntry[];
}

export function resolveArticles({ references, articles }: ResolveArticlesParams): ArticleEntry[] {
	const bySlug = new Map(articles.map((article) => [article.id, article]));

	return references.flatMap(({ id }) => bySlug.get(id) ?? []);
}

export function resolveArticle({ reference, articles }: ResolveArticleParams): ArticleEntry | undefined {
	return reference ? resolveArticles({ references: [reference], articles })[0] : undefined;
}

export async function getSiteAuthor(): Promise<AuthorEntry> {
	const siteAuthor = (await readAuthors()).find(({ data }) => data.slug === SITE_AUTHOR_SLUG);

	if (!siteAuthor) {
		throw new Error(
			`No published Article credits the byline the site is about (${SITE_AUTHOR_SLUG}), so the authors collection carries no such author`,
		);
	}

	return siteAuthor;
}

interface ReadMenuParams {
	name: MenuName;
	prerendered: boolean;
}

export async function readSiteSettings(prerendered: boolean) {
	const settings = entryOf(await getLiveEntry("site", { id: SITE_SETTINGS_ID, prerendered }));

	if (!settings) throw new Error("The site collection answered no settings entry");

	return settings.data;
}

export async function readMenu({ name, prerendered }: ReadMenuParams) {
	const menu = entryOf(await getLiveEntry("menus", { id: name, prerendered }));

	if (!menu) throw new Error(`The menus collection answered no ${name} menu`);

	return menu.data;
}
