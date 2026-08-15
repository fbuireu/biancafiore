import type { CollectionEntry } from "astro:content";
import { getEntry } from "astro:content";
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
