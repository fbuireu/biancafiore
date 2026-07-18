import type { RawArticle } from "@application/dto/article/types";
import type { RawAuthor } from "@application/dto/author/types";
import type { Reference } from "@shared/application/types";

interface GetArticlesByAuthorParams {
	rawAuthor: RawAuthor;
	rawArticles: RawArticle[];
}

export function getArticlesByAuthor({ rawAuthor, rawArticles }: GetArticlesByAuthorParams): Reference<"articles">[] {
	return rawArticles
		.filter(
			(article) => "fields" in article.fields.author && article.fields.author.fields.name === rawAuthor.fields.name,
		)
		.map((article) => ({
			id: article.fields.slug,
			collection: "articles",
		}));
}
