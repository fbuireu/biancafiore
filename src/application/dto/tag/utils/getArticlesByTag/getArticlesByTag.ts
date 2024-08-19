import type { ArticleDTO } from "@application/dto/article/types.ts";
import type { RawTag } from "@application/dto/tag/types.ts";

interface GetArticlesProps {
	rawTag: RawTag;
	articles: ArticleDTO[];
}

export function getArticlesByTag({ rawTag, articles }: GetArticlesProps) {
	return articles.filter((article) =>
		article.tags.map((tag) => tag.slug).includes(rawTag.fields.slug as unknown as string),
	);
}
