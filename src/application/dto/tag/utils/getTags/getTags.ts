import type { CollectionEntry } from "astro:content";
import { type RawTag, TagType } from "@application/dto/tag/types";
import type { Reference } from "@shared/application/types";

interface Articles {
	articles: CollectionEntry<"articles">[];
}

interface GetTags extends Articles {
	raw: RawTag[];
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

export async function getTags({ raw, articles }: GetTags) {
	return await Promise.all(
		raw.map(async (rawTag) => {
			const articlesByTag = getArticlesByTag({ rawTag, articles });

			return {
				name: rawTag.fields.name as unknown as string,
				slug: rawTag.fields.slug,
				type: TagType.TAG,
				count: articlesByTag.length,
				articles: articlesByTag,
			};
		}),
	);
}
