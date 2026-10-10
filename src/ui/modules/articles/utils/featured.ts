import type { ArticleEntry } from "@modules/core/utils/entries";

interface PartitionFeaturedReturn {
	featured?: ArticleEntry;
	rest: ArticleEntry[];
}

export function partitionFeatured(articles: ArticleEntry[]): PartitionFeaturedReturn {
	const featured =
		articles.find(({ data }) => data.isFeaturedArticle && data.featuredImage) ??
		articles.find(({ data }) => data.featuredImage);

	return {
		featured,
		rest: featured ? articles.filter(({ data }) => data.slug !== featured.data.slug) : articles,
	};
}
