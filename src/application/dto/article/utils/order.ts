import type { RawArticle } from "@application/dto/article/types";
import { articleReference } from "@application/dto/article/utils/reference";
import { sortFavoriteFirst } from "@domain/article";
import type { Reference } from "@domain/shared/reference";

interface OrderableArticle {
	reference: Reference<"articles">;
	isFavorite: boolean;
	publishDateISO: string;
}

const publishDateISO = (rawArticle: RawArticle): string => {
	const timestamp = Date.parse(rawArticle.fields.publishDate);

	return Number.isNaN(timestamp) ? "" : new Date(timestamp).toISOString();
};

export function toOrderableArticle(rawArticle: RawArticle): OrderableArticle {
	return {
		reference: articleReference(rawArticle),
		isFavorite: rawArticle.fields.isFavorite ?? false,
		publishDateISO: publishDateISO(rawArticle),
	};
}

export function orderArticleReferences(rawArticles: RawArticle[]): Reference<"articles">[] {
	return sortFavoriteFirst(rawArticles.map(toOrderableArticle)).map(({ reference }) => reference);
}
