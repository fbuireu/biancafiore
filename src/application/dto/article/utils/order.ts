import { sortFavoriteFirst } from "@domain/article/rules";
import type { Reference } from "@domain/shared/reference";
import type { AnyRawArticle } from "../types";
import { articleIsFavorite, articlePublishDateISO, articleReference } from "./reference";

interface OrderableArticle {
	reference: Reference<"articles">;
	isFavorite: boolean;
	publishDateISO: string;
}

function toOrderableArticle(rawArticle: AnyRawArticle): OrderableArticle {
	return {
		reference: articleReference(rawArticle),
		isFavorite: articleIsFavorite(rawArticle),
		publishDateISO: articlePublishDateISO(rawArticle),
	};
}

export function orderArticleReferences(rawArticles: AnyRawArticle[]): Reference<"articles">[] {
	return sortFavoriteFirst(rawArticles.map(toOrderableArticle)).map(({ reference }) => reference);
}
