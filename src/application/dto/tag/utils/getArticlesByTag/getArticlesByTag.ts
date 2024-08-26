import type { CollectionEntry } from "astro:content";
import type { RawTag } from "@application/dto/tag/types.ts";

interface GetArticlesProps {
	rawTag: RawTag;
	articles: CollectionEntry<"articles">[];
}

export function getArticlesByTag({ rawTag, articles }: GetArticlesProps) {
	return articles.filter((article) =>
		article.data.tags?.map((tag) => tag.slug).includes(rawTag.fields.slug as unknown as string),
	);
}
