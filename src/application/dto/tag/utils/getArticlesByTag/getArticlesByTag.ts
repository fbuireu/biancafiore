import type { ArticleDTO } from '@application/dto/article/articleDTO.ts';
import { type TagDTOItem, TagType } from '@application/dto/tag/tagDTO.ts';

export interface GetArticlesByTagProps {
	articles: ArticleDTO[];
	tag: TagDTOItem;
}

export function getArticlesByTag({ articles, tag }: GetArticlesByTagProps) {
	return articles.filter((article): ArticleDTO[] => {
		const { author, tags } = article.data;
		const { slug } = tag;

		if (tag.type === TagType.AUTHOR) return author.slug.includes(slug);

		return tags.includes(slug);
	});
}
