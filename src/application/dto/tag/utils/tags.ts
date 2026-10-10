import { type TagIndexEntryDTO, TagType } from "@domain/tag";
import type { AnyRawArticle } from "../../article/types";
import { orderArticleReferences } from "../../article/utils/order";
import { articleTagSlugs, tagsOf } from "../../article/utils/tags";
import type { RawAuthor } from "../../author/types";
import { authorIdentity, credits } from "../../author/utils/author";
import { tagIdentity } from "./tag";

interface GetAuthorsParams {
	rawAuthors: RawAuthor[];
	rawArticles: AnyRawArticle[];
}

export function getAuthors({ rawAuthors, rawArticles }: GetAuthorsParams): TagIndexEntryDTO[] {
	return rawAuthors.flatMap((rawAuthor) => {
		const { name, slug } = authorIdentity(rawAuthor);
		const articles = orderArticleReferences(rawArticles.filter((rawArticle) => credits({ rawAuthor, rawArticle })));

		if (articles.length === 0) return [];

		return [{ name, slug, type: TagType.AUTHOR, articles }];
	});
}

export function getTags(rawArticles: AnyRawArticle[]): TagIndexEntryDTO[] {
	const rawTags = new Map(rawArticles.flatMap(tagsOf).map((rawTag) => [rawTag.id, rawTag]));

	return [...rawTags.values()].map((rawTag) => {
		const { name, slug } = tagIdentity(rawTag);

		return {
			name,
			slug,
			type: TagType.TAG,
			articles: orderArticleReferences(rawArticles.filter((rawArticle) => articleTagSlugs(rawArticle).includes(slug))),
		};
	});
}
