import { getCollection } from "astro:content";
import { TagType } from "@application/dto/tag/types";
import type { RawTag, TagDTO } from "@application/dto/tag/types";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import { getArticlesByTag } from "./utils/getArticlesByTag";
import { groupBy } from "./utils/groupBy";

export const tagDTO: BaseDTO<RawTag[], Promise<TagDTO>> = {
	render: async (raw) => {
		const articles = await getCollection("articles");

		const tags = await Promise.all(
			raw.map(async (rawTag) => {
				const articlesByTag = getArticlesByTag({ rawTag, articles });

				return {
					name: rawTag.fields.name as unknown as string,
					slug: rawTag.fields.slug,
					type: TagType.TAG,
					count: articlesByTag.length,
					articles: articlesByTag,
				};
			}),
		);

		const authors = (await getCollection("authors")).map((author) => ({
			name: author.data.name,
			slug: author.data.slug,
			type: TagType.AUTHOR,
			count: author.data.articles.length,
			articles: author.data.articles,
		}));

		return groupBy({
			array: [...tags, ...authors],
			keyFn: ({ name }) => name.charAt(0).toUpperCase(),
		}) as unknown as TagDTO;
	},
};
