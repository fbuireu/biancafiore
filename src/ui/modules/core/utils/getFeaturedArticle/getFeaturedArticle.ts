import type { CollectionEntry } from "astro:content";

export function getFeaturedArticle(articles: CollectionEntry<"articles">[]): CollectionEntry<"articles"> {
	return (
		articles.find((article) => article.data.isFeaturedArticle && article.data.featuredImage) ??
		articles.find((article) => article.data.featuredImage) ??
		(articles.at(0) as CollectionEntry<"articles">)
	);
}
