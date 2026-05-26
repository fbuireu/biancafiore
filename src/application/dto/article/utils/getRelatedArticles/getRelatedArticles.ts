import type { RawArticle } from "@application/dto/article/types";
import type { Reference } from "@shared/application/types";

interface GetRelatedArticlesParams {
	rawArticle: RawArticle;
	allRawArticles: RawArticle[];
}

const MAX_RELATED_ARTICLES = 3;

function shuffle<T>(array: T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

export function getRelatedArticles({ rawArticle, allRawArticles }: GetRelatedArticlesParams): Reference<"articles">[] {
	const articleTags = new Set(rawArticle.fields.tags?.map((tag) => tag.fields.slug) ?? []);

	const candidates = allRawArticles.filter(({ fields }) => {
		if (fields.title === rawArticle.fields.title) return false;

		const allTags = fields.tags?.map((tag) => tag.fields.slug) || [];
		return allTags.some((slug) => articleTags.has(slug));
	});

	return shuffle(candidates)
		.slice(0, MAX_RELATED_ARTICLES)
		.map((relatedArticle) => ({
			id: String(relatedArticle.fields.slug),
			collection: "articles",
		}));
}
