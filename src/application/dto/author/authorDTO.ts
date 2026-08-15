import type { RawArticle } from "@application/dto/article/types";
import type { RawAuthor } from "@application/dto/author/types";
import type { AuthorDTO } from "@domain/author";
import type { BaseDTO } from "@domain/shared/baseDTO";
import { getArticlesByAuthor } from "./utils/articles";
import { createAuthor } from "./utils/author";

export const authorDTO: BaseDTO<[RawAuthor[], RawArticle[]], AuthorDTO[]> = {
	create: ([raw, rawArticles]) => {
		return raw.map((rawAuthor): AuthorDTO => {
			const author = createAuthor(rawAuthor);
			const articlesByAuthor = getArticlesByAuthor({ authorSlug: author.slug, rawArticles });

			return {
				...author,
				articles: articlesByAuthor,
				latestArticle: articlesByAuthor.at(0),
			};
		});
	},
};
