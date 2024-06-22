import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import { groupBy } from "./utils/groupBy";
import { getUniqueTags } from "./utils/getUniqueValues";
import type { ArticleDTO } from "@application/dto/article/articleDTO.ts";
import { deSlugify } from "@shared/ui/utils/deSlugify";

export enum TagType {
	TAG = "tag",
	AUTHOR = "author",
}

export interface TagDTOItem {
	name: string;
	slug: string;
	type: TagType;
	count: number;
}

export type TagDTO = Record<string, TagDTOItem[]>;

export const tagDTO: BaseDTO<ArticleDTO[], TagDTO> = {
	render: (raw) => {
		const tags: TagDTOItem[] = raw.flatMap((article) => [
			...article.data.tags.map((tag: string) => ({ name: deSlugify(tag), type: "tag" })),
			{ name: deSlugify(article.data.author.data.name), type: "author" },
		]);

		const uniqueTags: TagDTOItem[] = getUniqueTags(tags).sort((a, b) => a.name.localeCompare(b.name));

		return groupBy(uniqueTags, ({ name }) => name.charAt(0).toUpperCase());
	},
};
