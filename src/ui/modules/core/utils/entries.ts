import type { CollectionEntry } from "astro:content";
import { getCollection, getEntry } from "astro:content";
import { CONTACT_DETAILS } from "@const/const";
import type { Reference } from "@domain/shared/reference";

export async function resolveArticle(
	reference?: Reference<"articles">,
): Promise<CollectionEntry<"articles"> | undefined> {
	if (!reference) {
		return undefined;
	}

	return await getEntry(reference.collection, reference.id);
}

export async function resolveArticles(references: Reference<"articles">[]): Promise<CollectionEntry<"articles">[]> {
	const entries = await Promise.all(references.map((reference) => resolveArticle(reference)));

	return entries.filter((entry) => entry !== undefined);
}

export async function getSiteAuthor(): Promise<CollectionEntry<"authors">> {
	const authors = await getCollection("authors");
	const siteAuthor = authors.find(({ data }) => data.name === CONTACT_DETAILS.NAME);

	if (!siteAuthor) {
		throw new Error(`The authors collection carries no author named ${CONTACT_DETAILS.NAME}`);
	}

	return siteAuthor;
}
