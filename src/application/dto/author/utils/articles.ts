import type { RawArticle } from "@application/dto/article/types";
import { articleReference } from "@application/dto/article/utils/reference";
import type { Reference } from "@domain/shared/reference";

interface GetArticlesByAuthorParams {
	authorSlug: string;
	rawArticles: RawArticle[];
}

const publishedAt = (article: RawArticle): number => new Date(article.fields.publishDate).getTime();

export function getArticlesByAuthor({ authorSlug, rawArticles }: GetArticlesByAuthorParams): Reference<"articles">[] {
	return rawArticles
		.filter((article) => "fields" in article.fields.author && article.fields.author.fields.slug.trim() === authorSlug)
		.toSorted((first, second) => publishedAt(second) - publishedAt(first))
		.map((article) => articleReference(article));
}
