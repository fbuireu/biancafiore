import type { AuthorDTO } from "@domain/author";
import type { AnyRawArticle } from "../article/types";
import type { RawAuthor } from "./types";
import { getLatestArticleByAuthor } from "./utils/articles";
import { createAuthor } from "./utils/author";

interface CreateAuthorsParams {
	rawAuthors: RawAuthor[];
	rawArticles: AnyRawArticle[];
}

export function createAuthors({ rawAuthors, rawArticles }: CreateAuthorsParams): AuthorDTO[] {
	return rawAuthors.map(
		(rawAuthor): AuthorDTO => ({
			...createAuthor(rawAuthor),
			latestArticle: getLatestArticleByAuthor({ rawAuthor, rawArticles }),
		}),
	);
}
