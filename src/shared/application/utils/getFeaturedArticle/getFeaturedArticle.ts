import type { ArticleDTO } from "@application/dto/article/types.ts";

export function getFeaturedArticle(articles: ArticleDTO[]) {
	return (
		articles.find((article) => article.isFeaturedArticle && article.featuredImage) ??
		articles.find((article) => article.featuredImage) ??
		articles.at(0)
	);
}
