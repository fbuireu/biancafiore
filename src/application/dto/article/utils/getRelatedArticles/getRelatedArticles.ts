import type { RawArticle } from "@application/dto/article/types";
import { MAX_RELATED_ARTICLES } from "@const/index";
import type { Reference } from "@shared/application/types";

interface GetRelatedArticlesParams {
	rawArticle: RawArticle;
	allRawArticles: RawArticle[];
}

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
