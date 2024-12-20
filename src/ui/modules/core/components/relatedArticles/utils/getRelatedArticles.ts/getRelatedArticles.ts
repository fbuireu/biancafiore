import type { CollectionEntry } from "astro:content";
import { getEntry } from "astro:content";

export async function getRelatedArticles(article: CollectionEntry<"articles">) {
	const relatedArticles: CollectionEntry<"articles">[] = [];

	for (const { collection, id } of article.data.relatedArticles) {
		const article = await getEntry(collection, id);
		relatedArticles.push(...(article ? [article] : []));
	}

	return relatedArticles;
}
