import type { RawArticle } from "@application/dto/article/types";
import type { Reference } from "@shared/application/types";

interface GetRelatedArticlesParams {
	rawArticle: RawArticle;
	allRawArticles: RawArticle[];
}

const MAX_RELATED_ARTICLES = 3;

export function getRelatedArticles({ rawArticle, allRawArticles }: GetRelatedArticlesParams): Reference<"articles">[] {
	const articleTags = new Set(rawArticle.fields.tags.map((tag) => tag.fields.slug));

	return allRawArticles
		.filter(({ fields }) => {
			if (fields.title === rawArticle.fields.title) return;

			const allTags = fields.tags?.map((tag) => tag.fields.slug) || [];
			return allTags.some((slug) => articleTags.has(slug));
		})
		.slice(0, MAX_RELATED_ARTICLES)
		.map((relatedArticle) => ({
			id: String(relatedArticle.fields.slug),
			collection: "articles",
		}));
}
