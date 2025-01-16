import type { CollectionEntry } from "astro:content";
import type { RawTag, TagDTO } from "@application/dto/tag/types";
import { TagType } from "@application/dto/tag/types";
import type { Reference } from "@shared/application/types";

interface Articles {
	articles: CollectionEntry<"articles">[];
}

interface GetTags extends Articles {
	rawTags: RawTag[];
}

interface GetArticlesByTagParams extends Articles {
	rawTag: RawTag;
}

const getArticlesByTag = ({ rawTag, articles }: GetArticlesByTagParams): Reference<"articles">[] =>
	articles
		.filter(({ data: { tags } }) => tags?.some(({ slug }) => slug === String(rawTag.fields.slug)))
		.map(({ data: { slug } }) => ({
			id: slug,
			collection: "articles",
		}));

export async function getTags({ rawTags, articles }: GetTags): Promise<TagDTO["articles"]> {
	return await Promise.all(
		rawTags.map(async (rawTag) => {
			const articlesByTag = getArticlesByTag({ rawTag, articles });

			return {
				name: String(rawTag.fields.name),
				slug: String(rawTag.fields.slug),
				type: TagType.TAG,
				count: articlesByTag.length,
				articles: articlesByTag,
			};
		}),
	);
}
