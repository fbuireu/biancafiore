import type { RawArticle } from "@application/dto/article/types.ts";
import type { Entry } from "contentful";

interface GetArticlesByAuthorProps {
	rawArticles: Entry<RawArticle>[];
	author: string;
}

export function getArticlesByAuthor({ rawArticles, author }: GetArticlesByAuthorProps): RawArticle[] {
	return rawArticles
		.map((article) => article as unknown as RawArticle)
		.filter((article) => {
			const articleAuthor = article.fields.author;
			const authorName = articleAuthor.fields.name as unknown as string;

			return authorName === author;
		});
}
