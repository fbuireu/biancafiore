import { type EntriesQuery, fetchEntries, fetchEntry } from "@infrastructure/cms/entries";
import type { RawArticle } from "../dto/article/types";
import type { RawAuthor } from "../dto/author/types";
import { creditedAuthors } from "../dto/author/utils/author";

const ARTICLES_QUERY: EntriesQuery<never> = { collection: "articles", orderBy: "publish_date", order: "desc" };

export const fetchArticlesAndAuthors = async (): Promise<[RawArticle[], RawAuthor[]]> => {
	const [rawArticles] = await fetchEntries<[RawArticle]>(ARTICLES_QUERY);

	return [rawArticles, creditedAuthors(rawArticles)];
};

export const fetchArticle = (slug: string): Promise<RawArticle | undefined> =>
	fetchEntry<RawArticle>({ collection: ARTICLES_QUERY.collection, id: slug });
