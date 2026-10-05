import { type TagIndexEntryDTO, TagType } from "@domain/tag";
import type { ArticleSkeleton, RawArticle } from "../../article/types";
import { orderArticleReferences } from "../../article/utils/order";
import type { AuthorSkeleton, RawAuthor } from "../../author/types";
import { articleAuthorSlug, authorIdentity } from "../../author/utils/author";
import type { SelectedField } from "../../shared/select";
import type { RawTag } from "../types";
import { articleTagSlugs, tagIdentity } from "./tag";

export const TAG_INDEX_ARTICLE_FIELDS: SelectedField<ArticleSkeleton>[] = [
	"sys.id",
	"fields.slug",
	"fields.tags",
	"fields.author",
	"fields.isFavorite",
	"fields.publishDate",
];

export const TAG_INDEX_AUTHOR_FIELDS: SelectedField<AuthorSkeleton>[] = ["sys.id", "fields.name", "fields.slug"];

interface GetAuthorsParams {
	rawAuthors: RawAuthor[];
	rawArticles: RawArticle[];
}

export function getAuthors({ rawAuthors, rawArticles }: GetAuthorsParams): TagIndexEntryDTO[] {
	return rawAuthors.flatMap((rawAuthor) => {
		const { name, slug } = authorIdentity(rawAuthor);
		const articles = orderArticleReferences(rawArticles.filter((article) => articleAuthorSlug(article) === slug));

		if (articles.length === 0) return [];

		return [{ name, slug, type: TagType.AUTHOR, articles }];
	});
}

interface GetTagsParams {
	rawTags: RawTag[];
	rawArticles: RawArticle[];
}

export function getTags({ rawTags, rawArticles }: GetTagsParams): TagIndexEntryDTO[] {
	return rawTags.flatMap((rawTag) => {
		const { name, slug } = tagIdentity(rawTag);
		const articles = orderArticleReferences(rawArticles.filter((article) => articleTagSlugs(article).includes(slug)));

		if (articles.length === 0) return [];

		return [{ name, slug, type: TagType.TAG, articles }];
	});
}
