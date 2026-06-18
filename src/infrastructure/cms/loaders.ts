import type { CollectionEntry } from "astro:content";
import { articleDTO } from "@application/dto/article";
import type { ArticleDTO, ArticleResolver, RawArticle } from "@application/dto/article/types";
import type { RawAuthor } from "@application/dto/author/types";
import { cityDTO } from "@application/dto/city";
import type { RawCity } from "@application/dto/city/types";
import { projectDTO } from "@application/dto/project";
import type { RawProject } from "@application/dto/project/types";
import { tagDTO } from "@application/dto/tag";
import { testimonialDTO } from "@application/dto/testimonial";
import type { RawTestimonial } from "@application/dto/testimonial/types";
import { createImage } from "@shared/application/dto/utils/createImage";
import type { Reference } from "@shared/application/types";
import type { LiveLoader } from "astro/loaders";
import { indexById, queryCollection, queryTermsForEntries } from "./client";

/**
 * Custom Astro Live Content Collection loaders backed by EmDash.
 *
 * Content is fetched and transformed (via the existing DTO mappers) at request
 * time through `getLiveCollection` / `getLiveEntry`, so editorial changes go
 * live without a rebuild. The build-time collections in `content.config.ts`
 * are kept (with empty loaders) purely so the `CollectionEntry<T>` types — used
 * across the UI components — stay generated; these live loaders return the same
 * `data` shapes, adapted at the page boundary with {@link toEntry}.
 *
 * Each result carries a `cacheHint` (collection + per-entry tags and
 * `lastModified`) so responses can be cached/invalidated at the edge instead of
 * hitting the database on every request.
 *
 * @see https://docs.astro.build/en/guides/content-collections/#live-content-collections
 */

type CollectionName = "articles" | "authors" | "tags" | "cities" | "projects" | "testimonials";
type CollectionData<C extends CollectionName> = CollectionEntry<C>["data"];
type CacheHint = { tags?: string[]; lastModified?: Date };
type LoadedEntry<C extends CollectionName> = { id: string; data: CollectionData<C>; cacheHint?: CacheHint };

/**
 * `getLiveEntry(collection, "<slug>")` is delivered to `loadEntry` as `{ id }`
 * (a bare string id is normalised to this shape by Astro). Declaring it as the
 * loader's entry filter keeps `filter.id` typed without casts.
 */
type EntryFilter = { id: string };

/** Adapts a live entry into the build-time `CollectionEntry` shape components expect. */
export function toEntry<C extends CollectionName>(
	collection: C,
	entry: { id: string; data: CollectionData<C> },
): CollectionEntry<C> {
	return { ...entry, collection } as CollectionEntry<C>;
}

function latestModified(dates: Array<string | undefined>): Date | undefined {
	const times = dates
		.map((date) => (date ? new Date(date).getTime() : Number.NaN))
		.filter((time) => !Number.isNaN(time));
	return times.length ? new Date(Math.max(...times)) : undefined;
}

async function loadArticleData(): Promise<ArticleDTO[]> {
	const [rawArticles, rawAuthors] = await Promise.all([
		queryCollection<RawArticle>("articles", { orderBy: "publishDate", order: "desc" }),
		queryCollection<RawAuthor>("authors"),
	]);

	const tagsByArticleId = await queryTermsForEntries(
		"articles",
		rawArticles.map((article) => article.id),
		"tag",
	);

	const resolver: ArticleResolver = {
		authorsById: indexById(rawAuthors),
		tagsByArticleId,
		articleSlugById: new Map(rawArticles.map((article) => [article.id, String(article.data.slug)])),
	};

	return articleDTO.create(rawArticles, resolver);
}

function articleEntry(article: ArticleDTO): LoadedEntry<"articles"> {
	return {
		id: article.slug,
		data: article,
		cacheHint: { tags: ["articles", `article:${article.slug}`], lastModified: new Date(article.updatedAt) },
	};
}

export const articlesLoader: LiveLoader<CollectionData<"articles">, EntryFilter> = {
	name: "emdash-articles",
	loadCollection: async () => {
		const articles = await loadArticleData();
		return {
			entries: articles.map(articleEntry),
			cacheHint: { tags: ["articles"], lastModified: latestModified(articles.map((article) => article.updatedAt)) },
		};
	},
	loadEntry: async ({ filter }) => {
		const article = (await loadArticleData()).find((entry) => entry.slug === filter.id);
		return article ? articleEntry(article) : undefined;
	},
};

async function buildAuthorEntries(articles: ArticleDTO[]): Promise<Array<LoadedEntry<"authors">>> {
	const rawAuthors = await queryCollection<RawAuthor>("authors");

	return rawAuthors.map((entry) => {
		const author = entry.data;
		const authorArticles: Reference<"articles">[] = articles
			.filter((article) => article.author.slug === author.slug)
			.map((article) => ({ id: article.slug, collection: "articles" }));

		return {
			id: author.name,
			data: {
				name: author.name,
				slug: author.slug,
				description: author.description,
				jobTitle: author.jobTitle,
				currentCompany: author.currentCompany,
				profileImage: createImage(author.profileImage),
				socialNetworks: author.socialNetworks,
				articles: authorArticles,
				latestArticle: authorArticles.at(0),
			} as unknown as CollectionData<"authors">,
			cacheHint: { tags: ["authors", `author:${author.slug}`] },
		};
	});
}

export const authorsLoader: LiveLoader<CollectionData<"authors">, EntryFilter> = {
	name: "emdash-authors",
	loadCollection: async () => ({
		entries: await buildAuthorEntries(await loadArticleData()),
		cacheHint: { tags: ["authors"] },
	}),
	loadEntry: async ({ filter }) =>
		(await buildAuthorEntries(await loadArticleData())).find((entry) => entry.id === filter.id),
};

async function loadTagData(): Promise<Array<LoadedEntry<"tags">>> {
	const articles = await loadArticleData();
	const authors = await buildAuthorEntries(articles);

	const grouped = tagDTO.create({
		articles,
		authors: authors.map((author) => ({
			name: author.data.name,
			slug: author.data.slug,
			articles: author.data.articles ?? [],
		})),
	});

	return Object.keys(grouped).map((letter) => ({
		id: letter,
		data: { id: letter, name: letter, tags: grouped[letter] } as unknown as CollectionData<"tags">,
		cacheHint: { tags: ["articles", "authors", "tags"] },
	}));
}

export const tagsLoader: LiveLoader<CollectionData<"tags">, EntryFilter> = {
	name: "emdash-tags",
	loadCollection: async () => ({ entries: await loadTagData(), cacheHint: { tags: ["tags"] } }),
	loadEntry: async ({ filter }) => (await loadTagData()).find((entry) => entry.id === filter.id),
};

async function loadCityData(): Promise<Array<LoadedEntry<"cities">>> {
	const rawCities = await queryCollection<RawCity>("cities", { orderBy: "startDate", order: "asc" });
	return cityDTO.create(rawCities).map((city) => ({
		id: city.name,
		data: city as unknown as CollectionData<"cities">,
		cacheHint: { tags: ["cities", `city:${city.name}`] },
	}));
}

export const citiesLoader: LiveLoader<CollectionData<"cities">, EntryFilter> = {
	name: "emdash-cities",
	loadCollection: async () => ({ entries: await loadCityData(), cacheHint: { tags: ["cities"] } }),
	loadEntry: async ({ filter }) => (await loadCityData()).find((entry) => entry.id === filter.id),
};

async function loadProjectData(): Promise<Array<LoadedEntry<"projects">>> {
	const rawProjects = await queryCollection<RawProject>("projects");
	return projectDTO.create(rawProjects).map((project) => ({
		id: project.id,
		data: project as unknown as CollectionData<"projects">,
		cacheHint: { tags: ["projects", `project:${project.id}`] },
	}));
}

export const projectsLoader: LiveLoader<CollectionData<"projects">, EntryFilter> = {
	name: "emdash-projects",
	loadCollection: async () => ({ entries: await loadProjectData(), cacheHint: { tags: ["projects"] } }),
	loadEntry: async ({ filter }) => (await loadProjectData()).find((entry) => entry.id === filter.id),
};

async function loadTestimonialData(): Promise<Array<LoadedEntry<"testimonials">>> {
	const rawTestimonials = await queryCollection<RawTestimonial>("testimonials");
	return testimonialDTO.create(rawTestimonials).map((testimonial) => ({
		id: testimonial.author,
		data: testimonial as unknown as CollectionData<"testimonials">,
		cacheHint: { tags: ["testimonials"] },
	}));
}

export const testimonialsLoader: LiveLoader<CollectionData<"testimonials">, EntryFilter> = {
	name: "emdash-testimonials",
	loadCollection: async () => ({ entries: await loadTestimonialData(), cacheHint: { tags: ["testimonials"] } }),
	loadEntry: async ({ filter }) => (await loadTestimonialData()).find((entry) => entry.id === filter.id),
};
