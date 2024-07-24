import type { ArticleDTO } from "@application/dto/article/types.ts";
import type { RawTag } from "@application/dto/tag/types.ts";

export interface GetArticlesByTagProps {
	articles: ArticleDTO[];
	tag: RawTag;
}

export function getArticlesByTag({ articles, tag }: GetArticlesByTagProps) {
	return articles.filter((article) =>
		article.tags.some((articleTag) => articleTag.slug === (tag.fields.slug as unknown as string)),
	);
}
