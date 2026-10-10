import { type EntriesQuery, fetchEntries } from "@infrastructure/cms/entries";
import type { RawArticle } from "../dto/article/types";
import { AUTHOR_ARTICLES_FIELD, type RawAuthor } from "../dto/author/types";

const ARTICLES_QUERY: EntriesQuery<never> = { collection: "articles", orderBy: "publish_date", order: "desc" };

const AUTHORS_QUERY: EntriesQuery<typeof AUTHOR_ARTICLES_FIELD> = {
	collection: "authors",
	references: [AUTHOR_ARTICLES_FIELD],
};

export const fetchArticlesAndAuthors = () => fetchEntries<[RawArticle, RawAuthor]>(ARTICLES_QUERY, AUTHORS_QUERY);
