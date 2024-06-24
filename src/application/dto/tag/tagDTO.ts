import type { ArticleDTO } from "@application/dto/article/articleDTO.ts";
import {
	type GetArticlesByTagProps,
	getArticlesByTag,
} from "@application/dto/tag/utils/getArticlesByTag/getArticlesByTag.ts";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import { deSlugify } from "@shared/ui/utils/deSlugify";
import { getUniqueTags } from "./utils/getUniqueValues";
import { groupBy } from "./utils/groupBy";

export enum TagType {
	TAG = "tag",
	AUTHOR = "author",
}

export interface TagDTOItem {
	name: string;
	slug: string;
	type: TagType;
	count: number;
	articles: ArticleDTO[];
}

export type TagDTO = Record<string, TagDTOItem[]>;

export const tagDTO: BaseDTO<ArticleDTO[], Promise<TagDTO>> = {
	render: async (raw) => {
		const tags: TagDTOItem[] = raw.flatMap((article) => [
			...article.data.tags.map((tag: string) => ({ name: deSlugify(tag), type: TagType.TAG })),
			{ name: deSlugify(article.data.author.data.name), type: TagType.AUTHOR },
		]);

		const uniqueTags: TagDTOItem[] = getUniqueTags(tags)
			.sort((a, b) => a.name.localeCompare(b.name))
			.map((tag) => ({
				...tag,
				articles: getArticlesByTag(<GetArticlesByTagProps>{ articles: raw, tag }),
			}));

		return groupBy({
			array: uniqueTags,
			keyFn: ({ name }) => name.charAt(0).toUpperCase(),
		});
	},
};
