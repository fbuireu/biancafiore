import type { CollectionEntry } from "astro:content";
import type { ArticleDTO } from "@application/dto/article";

interface GetArticlesByAuthorProps {
	articles: CollectionEntry<"articles">[];
	author: CollectionEntry<"authors">["id"];
}

export function getArticlesByAuthor({ articles, author }: GetArticlesByAuthorProps): ArticleDTO[] {
	return articles.filter((article) => article.data.author.slug === author);
}
