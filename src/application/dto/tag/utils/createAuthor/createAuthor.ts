import type { ArticleDTO } from "@application/dto/article/types.ts";
import type { AuthorDTO } from "@application/dto/author/types.ts";
import { TagType } from "@application/dto/tag/types.ts";

interface CreateAuthorProps {
	author: AuthorDTO;
	articles: ArticleDTO[];
}

export function createAuthor({ author, articles }: CreateAuthorProps) {
	return {
		name: author.name,
		slug: author.slug,
		type: TagType.AUTHOR,
		count: author.articles.length,
		articles: articles.filter((article) => article.author.slug === author.slug),
	};
}
