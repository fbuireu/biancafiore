import type { RawArticle } from "@application/dto/article/types";
import type { Reference } from "@shared/application/types";

interface GetRelatedArticlesParams {
	rawArticle: RawArticle;
	allRawArticles: RawArticle[];
}

export function getRelatedArticles({ rawArticle, allRawArticles }: GetRelatedArticlesParams): Reference<"articles">[] {
	const articleTags = new Set(rawArticle.fields.tags?.map((tag) => tag.fields.slug) ?? []);

	return allRawArticles
		.filter(({ fields }) => {
			if (fields.title === rawArticle.fields.title) return false;

			const allTags = fields.tags?.map((tag) => tag.fields.slug) || [];
			return allTags.some((slug) => articleTags.has(slug));
		})
		.slice(0, 6)
		.map((relatedArticle) => ({
			id: String(relatedArticle.fields.slug),
			collection: "articles",
		}));
}
