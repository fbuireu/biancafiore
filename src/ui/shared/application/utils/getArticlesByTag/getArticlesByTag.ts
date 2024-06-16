import type { ArticleDTO } from '@application/dto/article/articleDTO.ts';
import type { TagDTOItem } from '@application/dto/tag/tagDTO.ts';
import { TagType } from '@application/dto/tag/tagDTO.ts';
import { deSlugify } from '@shared/ui/utils/deSlugify';

interface GetArticlesByTagProps {
	articles: ArticleDTO[];
	currentTag: TagDTOItem;
}

export function getArticlesByTag({ articles, currentTag }: GetArticlesByTagProps): ArticleDTO[] {
	return articles.filter((article) => {
		const { author, tags } = article.data;
		const { name } = currentTag;

		if (currentTag.type === TagType.AUTHOR) return author.data.name === deSlugify(name);
		return tags.includes(name);
	});
}
