import type { RawTag } from "@application/dto/tag/types";
import type { Reference } from "@domain/shared/reference";
import { type TagDTO, TagType } from "@domain/tag";
import type { Entry, EntrySkeletonType } from "contentful";

interface GetAuthorsParams {
	rawAuthors: Entry<EntrySkeletonType>[];
	rawArticles: Entry<EntrySkeletonType>[];
}

export function getAuthors({ rawAuthors, rawArticles }: GetAuthorsParams): TagDTO["authors"] {
	return rawAuthors.flatMap((author) => {
		const slug = String(author.fields.slug).trim();
		const articles: Reference<"articles">[] = rawArticles
			.filter((article) => {
				const articleAuthor = article.fields.author as Entry<EntrySkeletonType> | undefined;
				return String(articleAuthor?.fields?.slug).trim() === slug;
			})
			.map((article) => ({
				id: String(article.fields.slug).trim(),
				collection: "articles",
			}));

		if (articles.length === 0) return [];

		return [
			{
				name: String(author.fields.name).trim(),
				slug,
				type: TagType.AUTHOR,
				count: articles.length,
				articles,
			},
		];
	});
}

interface GetTags {
	rawTags: RawTag[];
	rawArticles: Entry<EntrySkeletonType>[];
}

interface GetArticlesByTagParams {
	rawTag: RawTag;
	rawArticles: Entry<EntrySkeletonType>[];
}

const getArticlesByTag = ({ rawTag, rawArticles }: GetArticlesByTagParams): Reference<"articles">[] =>
	rawArticles
		.filter((article) => {
			const tags = article.fields.tags as Array<Entry<EntrySkeletonType>> | undefined;
			return tags?.some((tag) => String(tag.fields?.slug).trim() === String(rawTag.fields.slug).trim());
		})
		.map((article) => ({
			id: String(article.fields.slug).trim(),
			collection: "articles",
		}));

export function getTags({ rawTags, rawArticles }: GetTags): TagDTO["articles"] {
	return rawTags.flatMap((rawTag) => {
		const articlesByTag = getArticlesByTag({ rawTag, rawArticles });

		if (articlesByTag.length === 0) return [];

		return [
			{
				name: String(rawTag.fields.name).trim(),
				slug: String(rawTag.fields.slug).trim(),
				type: TagType.TAG,
				count: articlesByTag.length,
				articles: articlesByTag,
			},
		];
	});
}
