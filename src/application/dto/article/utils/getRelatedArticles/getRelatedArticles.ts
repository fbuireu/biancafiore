import type { RawArticle } from "@application/dto/article/types";
import { MAX_RELATED_ARTICLES } from "@const/index";

interface GetRelatedArticlesProps {
	rawArticle: RawArticle;
	allRawArticles: RawArticle[];
}

export function getRelatedArticles({ rawArticle, allRawArticles }: GetRelatedArticlesProps) {
	const articleTagsSlugs = rawArticle.fields.tags.map((tag) => tag.fields.slug);

	return allRawArticles
		.filter(({ fields }) => {
			const allTagsSlugs = fields.tags?.map((tag) => tag.fields.slug);

			return fields.title !== rawArticle.fields.title && allTagsSlugs?.some((slug) => articleTagsSlugs.includes(slug));
		})
		.slice(0, MAX_RELATED_ARTICLES)
		.map((relatedArticle) => ({
			id: relatedArticle.fields.slug,
			collection: "articles",
		}));
}
