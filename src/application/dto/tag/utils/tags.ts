import { articleReference } from "@application/dto/article/utils/reference";
import type { RawTag } from "@application/dto/tag/types";
import { sortFavoriteFirst } from "@domain/article";
import type { Reference } from "@domain/shared/reference";
import { type TagIndexEntryDTO, TagType } from "@domain/tag";
import type { Entry, EntrySkeletonType } from "contentful";

const toArticleReferences = (rawArticles: Entry<EntrySkeletonType>[]): Reference<"articles">[] =>
	sortFavoriteFirst(
		rawArticles.map((article) => ({
			reference: articleReference(article),
			isFavorite: Boolean(article.fields.isFavorite),
			publishDateISO: String(article.fields.publishDate ?? ""),
		})),
	).map(({ reference }) => reference);

interface GetAuthorsParams {
	rawAuthors: Entry<EntrySkeletonType>[];
	rawArticles: Entry<EntrySkeletonType>[];
}

export function getAuthors({ rawAuthors, rawArticles }: GetAuthorsParams): TagIndexEntryDTO[] {
	return rawAuthors.flatMap((author) => {
		const slug = String(author.fields.slug).trim();
		const articles = toArticleReferences(
			rawArticles.filter((article) => {
				const articleAuthor = article.fields.author as Entry<EntrySkeletonType> | undefined;
				return String(articleAuthor?.fields?.slug).trim() === slug;
			}),
		);

		if (articles.length === 0) return [];

		return [
			{
				name: String(author.fields.name).trim(),
				slug,
				type: TagType.AUTHOR,
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
	toArticleReferences(
		rawArticles.filter((article) => {
			const tags = article.fields.tags as Array<Entry<EntrySkeletonType>> | undefined;
			return tags?.some((tag) => String(tag.fields?.slug).trim() === String(rawTag.fields.slug).trim());
		}),
	);

export function getTags({ rawTags, rawArticles }: GetTags): TagIndexEntryDTO[] {
	return rawTags.flatMap((rawTag) => {
		const articles = getArticlesByTag({ rawTag, rawArticles });

		if (articles.length === 0) return [];

		return [
			{
				name: String(rawTag.fields.name).trim(),
				slug: String(rawTag.fields.slug).trim(),
				type: TagType.TAG,
				articles,
			},
		];
	});
}
