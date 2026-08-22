import type { RawArticle } from "@application/dto/article/types";
import type { RawAuthor } from "@application/dto/author/types";
import type { AuthorDTO } from "@domain/author";
import { getLatestArticleByAuthor } from "./utils/articles";
import { createAuthor } from "./utils/author";

export interface CreateAuthorsParams {
	rawAuthors: RawAuthor[];
	rawArticles: RawArticle[];
}

export function createAuthors({ rawAuthors, rawArticles }: CreateAuthorsParams): AuthorDTO[] {
	return rawAuthors.map((rawAuthor): AuthorDTO => {
		const author = createAuthor(rawAuthor);

		return {
			...author,
			latestArticle: getLatestArticleByAuthor({ authorSlug: author.slug, rawArticles }),
		};
	});
}
