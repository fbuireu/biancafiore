import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { buildArticleListSchema } from "./jsonLd";

interface BlogPreview {
	articles: CollectionEntry<"articles">[];
	itemListSchema: ReturnType<typeof buildArticleListSchema>;
}

export async function blogPreview(limit: number): Promise<BlogPreview> {
	const articles = (await getCollection("articles")).slice(0, limit);

	return { articles, itemListSchema: buildArticleListSchema(articles.map(({ data }) => data.slug)) };
}
