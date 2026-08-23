import type { RawArticle } from "@application/dto/article/types";
import { orderArticleReferences } from "@application/dto/article/utils/order";
import type { RawAuthor } from "@application/dto/author/types";
import type { RawTag } from "@application/dto/tag/types";
import { type TagIndexEntryDTO, TagType } from "@domain/tag";

export const TAG_INDEX_ARTICLE_FIELDS: `fields.${string}`[] = [
	"fields.slug",
	"fields.tags",
	"fields.author",
	"fields.isFavorite",
	"fields.publishDate",
];

export const TAG_INDEX_AUTHOR_FIELDS: `fields.${string}`[] = ["fields.name", "fields.slug"];

const authorSlugOf = (article: RawArticle): string | undefined =>
	"fields" in article.fields.author ? article.fields.author.fields.slug.trim() : undefined;

const tagSlugsOf = (article: RawArticle): string[] =>
	(article.fields.tags ?? []).flatMap((tag) => ("fields" in tag ? [tag.fields.slug.trim()] : []));

interface GetAuthorsParams {
	rawAuthors: RawAuthor[];
	rawArticles: RawArticle[];
}

export function getAuthors({ rawAuthors, rawArticles }: GetAuthorsParams): TagIndexEntryDTO[] {
	return rawAuthors.flatMap((rawAuthor) => {
		const slug = rawAuthor.fields.slug.trim();
		const articles = orderArticleReferences(rawArticles.filter((article) => authorSlugOf(article) === slug));

		if (articles.length === 0) return [];

		return [
			{
				name: rawAuthor.fields.name.trim(),
				slug,
				type: TagType.AUTHOR,
				articles,
			},
		];
	});
}

interface GetTagsParams {
	rawTags: RawTag[];
	rawArticles: RawArticle[];
}

export function getTags({ rawTags, rawArticles }: GetTagsParams): TagIndexEntryDTO[] {
	return rawTags.flatMap((rawTag) => {
		const slug = rawTag.fields.slug.trim();
		const articles = orderArticleReferences(rawArticles.filter((article) => tagSlugsOf(article).includes(slug)));

		if (articles.length === 0) return [];

		return [
			{
				name: rawTag.fields.name.trim(),
				slug,
				type: TagType.TAG,
				articles,
			},
		];
	});
}
