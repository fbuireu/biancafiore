import type { RawArticle } from "@application/dto/article/types";
import type { RawAuthor } from "@application/dto/author/types";
import type { Reference } from "@domain/shared/reference";

interface GetArticlesByAuthorParams {
	rawAuthor: RawAuthor;
	rawArticles: RawArticle[];
}

const publishedAt = (article: RawArticle): number => new Date(article.fields.publishDate).getTime();

export function getArticlesByAuthor({ rawAuthor, rawArticles }: GetArticlesByAuthorParams): Reference<"articles">[] {
	const authorSlug = rawAuthor.fields.slug.trim();

	return rawArticles
		.filter((article) => "fields" in article.fields.author && article.fields.author.fields.slug.trim() === authorSlug)
		.toSorted((first, second) => publishedAt(second) - publishedAt(first))
		.map((article) => ({
			id: article.fields.slug,
			collection: "articles",
		}));
}
