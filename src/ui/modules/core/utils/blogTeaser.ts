import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { buildArticleListSchema } from "@modules/core/utils/jsonLd";

interface BlogTeaser {
	articles: CollectionEntry<"articles">[];
	itemListSchema: ReturnType<typeof buildArticleListSchema>;
}

export async function blogTeaser(limit: number): Promise<BlogTeaser> {
	const articles = (await getCollection("articles")).slice(0, limit);

	return { articles, itemListSchema: buildArticleListSchema(articles.map(({ data }) => data.slug)) };
}
