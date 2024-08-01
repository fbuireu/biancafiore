import type { ArticleDTO } from "@application/dto/article/types.ts";
import type { RawTag } from "@application/dto/tag/types.ts";

interface GetArticlesProps {
	tag: RawTag;
	articles: ArticleDTO[];
}

export function getArticlesByTag({ tag, articles }: GetArticlesProps) {
	return articles.filter((article) =>
		article.tags.map((tag) => tag.slug).includes(tag.fields.slug as unknown as string),
	);
}
