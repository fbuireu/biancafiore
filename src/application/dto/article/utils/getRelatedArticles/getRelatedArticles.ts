import type { RawArticle } from "@application/dto/article/types";
import { MAX_RELATED_ARTICLES } from "@const/index";
import type { Reference } from "@shared/application/types";

interface GetRelatedArticlesParams {
	rawArticle: RawArticle;
	allRawArticles: RawArticle[];
}

export function getRelatedArticles({ rawArticle, allRawArticles }: GetRelatedArticlesParams): Reference<"articles">[] {
	const articleTagsSlugs = rawArticle.fields.tags.map((tag) => tag.fields.slug);

	return allRawArticles
		.filter(({ fields }) => {
			const allTagsSlugs = fields.tags?.map((tag) => tag.fields.slug);

			return fields.title !== rawArticle.fields.title && allTagsSlugs?.some((slug) => articleTagsSlugs.includes(slug));
		})
		.slice(0, MAX_RELATED_ARTICLES)
		.map((relatedArticle) => ({
			id: String(relatedArticle.fields.slug),
			collection: "articles",
		}));
}
