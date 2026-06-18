import type { ArticleResolver, RawArticle } from "@application/dto/article/types";
import type { EmDashEntry, Reference } from "@shared/application/types";

interface GetRelatedArticlesParams {
	entry: EmDashEntry<RawArticle>;
	allEntries: EmDashEntry<RawArticle>[];
	resolver?: ArticleResolver;
}

const MAX_RELATED_ARTICLES = 6;

export function getRelatedArticles({ entry, allEntries, resolver }: GetRelatedArticlesParams): Reference<"articles">[] {
	const tagSlugs = new Set((resolver?.tagsByArticleId.get(entry.id) ?? []).map((tag) => tag.slug));

	return allEntries
		.filter((other) => {
			if (other.id === entry.id) return false;
			return (resolver?.tagsByArticleId.get(other.id) ?? []).some((tag) => tagSlugs.has(tag.slug));
		})
		.slice(0, MAX_RELATED_ARTICLES)
		.map((other) => ({
			id: String(other.data.slug),
			collection: "articles",
		}));
}
