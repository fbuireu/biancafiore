import { getLiveCollection, getLiveEntry } from "astro:content";
import { SITE_AUTHOR_SLUG } from "@const/const";
import type { ArticleDTO, ArticleSummaryDTO } from "@domain/article";
import type { AuthorDTO } from "@domain/author";
import type { CityDTO } from "@domain/city";
import type { MenuDTO, MenuName } from "@domain/menu";
import type { ProjectDTO } from "@domain/project";
import type { Reference } from "@domain/shared/reference";
import { SITE_SETTINGS_ID, type SiteSettingsDTO } from "@domain/site";
import type { TagIndexEntryDTO } from "@domain/tag";
import type { TestimonialDTO } from "@domain/testimonial";
import type { LiveDataEntry } from "astro";

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

export type ArticleEntry = LiveDataEntry<ArticleSummaryDTO>;
export type WholeArticleEntry = LiveDataEntry<ArticleDTO>;
type AuthorEntry = LiveDataEntry<AuthorDTO>;
export type CityEntry = LiveDataEntry<CityDTO>;
export type TestimonialEntry = LiveDataEntry<TestimonialDTO>;

export const readArticles = async (): Promise<ArticleEntry[]> => entriesOf(await getLiveCollection("articles"));
export const readArticle = async (slug: string): Promise<WholeArticleEntry | undefined> =>
	entryOf(await getLiveEntry("article", slug));
export const readAuthors = async (): Promise<AuthorEntry[]> => entriesOf(await getLiveCollection("authors"));
export const readCities = async (): Promise<CityEntry[]> => entriesOf(await getLiveCollection("cities"));
export const readProjects = async (): Promise<LiveDataEntry<ProjectDTO>[]> =>
	entriesOf(await getLiveCollection("projects"));
export const readTags = async (): Promise<LiveDataEntry<TagIndexEntryDTO>[]> =>
	entriesOf(await getLiveCollection("tags"));
export const readTag = async (slug: string): Promise<LiveDataEntry<TagIndexEntryDTO> | undefined> =>
	entryOf(await getLiveEntry("tags", slug));
export const readTestimonials = async (): Promise<TestimonialEntry[]> =>
	entriesOf(await getLiveCollection("testimonials"));

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

export async function readSiteSettings(prerendered: boolean): Promise<SiteSettingsDTO> {
	const settings = entryOf(await getLiveEntry("site", { id: SITE_SETTINGS_ID, prerendered }));

	if (!settings) throw new Error("The site collection answered no settings entry");

	return settings.data;
}

export async function readMenu({ name, prerendered }: ReadMenuParams): Promise<MenuDTO> {
	const menu = entryOf(await getLiveEntry("menus", { id: name, prerendered }));

	if (!menu) throw new Error(`The menus collection answered no ${name} menu`);

	return menu.data;
}
