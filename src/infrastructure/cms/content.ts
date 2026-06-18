import { type CollectionEntry, getLiveCollection, getLiveEntry } from "astro:content";
import { toEntry } from "./loaders";

/**
 * Request-time content accessors. Thin wrappers over Astro's live collection
 * API (`getLiveCollection` / `getLiveEntry`, backed by the EmDash loaders in
 * `src/live.config.ts`) that adapt entries into the `CollectionEntry<T>` shape
 * the UI components already expect. Replaces the build-time `getCollection` /
 * `getEntry` calls so editorial changes publish without a rebuild.
 */

export async function getArticles(): Promise<CollectionEntry<"articles">[]> {
	const { entries } = await getLiveCollection("articles");
	return (entries ?? []).map((entry) => toEntry("articles", entry));
}

export async function getArticle(slug: string): Promise<CollectionEntry<"articles"> | undefined> {
	const { entry } = await getLiveEntry("articles", slug);
	return entry ? toEntry("articles", entry) : undefined;
}

export async function getAuthors(): Promise<CollectionEntry<"authors">[]> {
	const { entries } = await getLiveCollection("authors");
	return (entries ?? []).map((entry) => toEntry("authors", entry));
}

export async function getTagGroups(): Promise<CollectionEntry<"tags">[]> {
	const { entries } = await getLiveCollection("tags");
	return (entries ?? []).map((entry) => toEntry("tags", entry));
}

export async function getCities(): Promise<CollectionEntry<"cities">[]> {
	const { entries } = await getLiveCollection("cities");
	return (entries ?? []).map((entry) => toEntry("cities", entry));
}

export async function getProjects(): Promise<CollectionEntry<"projects">[]> {
	const { entries } = await getLiveCollection("projects");
	return (entries ?? []).map((entry) => toEntry("projects", entry));
}

export async function getTestimonials(): Promise<CollectionEntry<"testimonials">[]> {
	const { entries } = await getLiveCollection("testimonials");
	return (entries ?? []).map((entry) => toEntry("testimonials", entry));
}
