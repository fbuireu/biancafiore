import type { ArticleResolver } from "@application/dto/article/types";
import type { Reference } from "@shared/application/types";

export function createRelatedArticles(
	relatedArticleIds: string[] | undefined,
	resolver?: ArticleResolver,
): Reference<"articles">[] {
	return (relatedArticleIds ?? [])
		.map((id) => resolver?.articleSlugById.get(id))
		.filter((slug): slug is string => Boolean(slug))
		.map((slug) => ({
			id: slug,
			collection: "articles",
		}));
}
