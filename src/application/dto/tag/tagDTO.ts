import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import { groupBy } from "./utils/groupBy";
import type { ArticleDTO } from "@application/dto/article/articleDTO.ts";
import { slugify } from "@shared/ui/utils/slugify";
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

		const uniqueTags: TagDTOItem[] = [...new Set(tags.map(({ name }) => name))]
			.map((name) => {
				const type = tags.find((tag) => tag.name === name)?.type ?? TagType.TAG;
				const count = tags.filter((tag) => tag.name === name).length;
				const slug = slugify(name);

				return { name, type, count, slug };
			})
			.sort((a, b) => a.name.localeCompare(b.name));

		return groupBy(uniqueTags, ({ name }) => name.charAt(0).toUpperCase());
	},
};
