import type { ArticleDTO } from "@application/dto/article/articleDTO.ts";
import type { TagDTOItem } from "@application/dto/tag/tagDTO.ts";
import { TagType } from "@application/dto/tag/tagDTO.ts";

interface GetArticlesByTagProps {
	articles: ArticleDTO[];
	currentTag: TagDTOItem;
}

export function getArticlesByTag({ articles, currentTag }: GetArticlesByTagProps): ArticleDTO[] {
	return articles.filter((article): ArticleDTO[] => {
		const { author, tags } = article.data;
		const { slug } = currentTag;

		if (currentTag.type === TagType.AUTHOR) return author.data.id.includes(slug);
		return tags.includes(slug);
	});
}
