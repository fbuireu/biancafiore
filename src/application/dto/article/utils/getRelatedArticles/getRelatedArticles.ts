import type { RawArticle } from "@application/dto/article/types";
import type { Reference } from "@shared/application/types";

interface GetRelatedArticlesParams {
	rawArticle: RawArticle;
	allRawArticles: RawArticle[];
}

function getTagSlugs(article: RawArticle): string[] {
	return (article.fields.tags ?? []).flatMap((tag) => ("fields" in tag ? [tag.fields.slug] : []));
}

export function getRelatedArticles({ rawArticle, allRawArticles }: GetRelatedArticlesParams): Reference<"articles">[] {
	const articleTags = new Set(getTagSlugs(rawArticle));

	return allRawArticles
		.filter((article) => {
			if (article.fields.title === rawArticle.fields.title) return false;

			const allTags = getTagSlugs(article);
			return allTags.some((slug) => articleTags.has(slug));
		})
		.slice(0, 6)
		.map((relatedArticle) => ({
			id: relatedArticle.fields.slug,
			collection: "articles",
		}));
}
