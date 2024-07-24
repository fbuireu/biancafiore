import type { ArticleDTO } from "@application/dto/article/types.ts";
import { type RawTag, TagType } from "@application/dto/tag/types.ts";
import { getArticlesByTag } from "@application/dto/tag/utils/getArticlesByTag";

interface CreateTagProps {
	tag: RawTag;
	articles: ArticleDTO[];
}

export function createTag({ tag, articles }: CreateTagProps) {
	const articlesByTag = getArticlesByTag({ articles, tag });

	return {
		name: tag.fields.name as unknown as string,
		slug: tag.fields.slug as unknown as string,
		type: TagType.TAG,
		count: articlesByTag.length,
		articles: articlesByTag,
	};
}
