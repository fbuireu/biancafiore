import type { CollectionEntry } from "astro:content";

export function getFeaturedArticle(articles: CollectionEntry<"articles">[]): CollectionEntry<"articles"> | undefined {
	return (
		articles.find((article) => article.data.isFeaturedArticle && article.data.featuredImage) ??
		articles.find((article) => article.data.featuredImage)
	);
}
