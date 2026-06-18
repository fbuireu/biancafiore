import type { ArticleResolver } from "@application/dto/article/types";
import type { BaseTagDTO } from "@application/dto/tag/types";

export function createTags(articleId: string, resolver?: ArticleResolver): BaseTagDTO[] {
	return (resolver?.tagsByArticleId.get(articleId) ?? []).map((tag) => ({
		name: tag.name.trim(),
		slug: tag.slug.trim(),
	}));
}
