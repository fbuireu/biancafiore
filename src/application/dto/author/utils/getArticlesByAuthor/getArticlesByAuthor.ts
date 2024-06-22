import type { CollectionEntry } from "astro:content";
import type { ArticleDTO } from "@application/dto/article";

export function getArticlesByAuthor(
	articles: CollectionEntry<"articles">[],
	author: CollectionEntry<"authors">["id"],
): ArticleDTO[] {
	return articles.filter((article) => article.data.author.slug === author);
}
