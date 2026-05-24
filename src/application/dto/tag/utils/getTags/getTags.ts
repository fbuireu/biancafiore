import type { Entry, EntrySkeletonType } from "contentful";
import type { RawTag, TagDTO } from "@application/dto/tag/types";
import { TagType } from "@application/dto/tag/types";
import type { Reference } from "@shared/application/types";

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
	return rawTags.map((rawTag) => {
		const articlesByTag = getArticlesByTag({ rawTag, rawArticles });

		return {
			name: String(rawTag.fields.name).trim(),
			slug: String(rawTag.fields.slug).trim(),
			type: TagType.TAG,
			count: articlesByTag.length,
			articles: articlesByTag,
		};
	});
}
