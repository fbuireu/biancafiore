import type { CollectionEntry } from "astro:content";
import { getArticle } from "@infrastructure/cms/content";

export async function getRelatedArticles(article: CollectionEntry<"articles">): Promise<CollectionEntry<"articles">[]> {
	const relatedArticles: CollectionEntry<"articles">[] = [];

	for (const { id } of article.data.relatedArticles) {
		const related = await getArticle(id);
		relatedArticles.push(...(related ? [related] : []));
	}

	return relatedArticles;
}
