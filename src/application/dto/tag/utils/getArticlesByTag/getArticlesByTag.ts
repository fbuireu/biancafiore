import type { CollectionEntry } from "astro:content";
import type { RawTag } from "@application/dto/tag/types.ts";
import type { Reference } from "@shared/application/types";

interface GetArticlesParams {
	rawTag: RawTag;
	articles: CollectionEntry<"articles">[];
}

export function getArticlesByTag({ rawTag, articles }: GetArticlesParams): Reference<"articles">[] {
	return articles
		.filter(({ data: { tags } }) => tags?.some(({ slug }) => slug === String(rawTag.fields.slug)))
		.map(({ data: { slug } }) => ({
			id: slug,
			collection: "articles",
		}));
}
