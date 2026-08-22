import type { CollectionEntry } from "astro:content";

interface PartitionFeaturedReturn {
	featured?: CollectionEntry<"articles">;
	rest: CollectionEntry<"articles">[];
}

export function partitionFeatured(articles: CollectionEntry<"articles">[]): PartitionFeaturedReturn {
	const featured =
		articles.find(({ data }) => data.isFeaturedArticle && data.featuredImage) ??
		articles.find(({ data }) => data.featuredImage);

	return {
		featured,
		rest: featured ? articles.filter(({ data }) => data.slug !== featured.data.slug) : articles,
	};
}
