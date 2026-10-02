import { publishDateISO, sortFavoriteFirst } from "@domain/article/rules";
import type { Reference } from "@domain/shared/reference";
import type { RawArticle } from "../types";
import { articleReference } from "./reference";

interface OrderableArticle {
	reference: Reference<"articles">;
	isFavorite: boolean;
	publishDateISO: string;
}

function toOrderableArticle(rawArticle: RawArticle): OrderableArticle {
	return {
		reference: articleReference(rawArticle),
		isFavorite: rawArticle.fields.isFavorite ?? false,
		publishDateISO: publishDateISO(rawArticle.fields.publishDate),
	};
}

export function orderArticleReferences(rawArticles: RawArticle[]): Reference<"articles">[] {
	return sortFavoriteFirst(rawArticles.map(toOrderableArticle)).map(({ reference }) => reference);
}
