import { articleDTO } from "@application/dto/article";
import type { RawArticle } from "@application/dto/article/types";
import { authorDTO } from "@application/dto/author";
import type { RawAuthor } from "@application/dto/author/types";
import { type RawTag, type TagDTO, TagType } from "@application/dto/tag/types";
import { client } from "@lib/contentful.ts";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import { groupBy } from "./utils/groupBy";

export const tagDTO: BaseDTO<RawTag[], Promise<TagDTO>> = {
	render: async (raw) => {
		const { items: rawAuthors } = await client.getEntries<RawAuthor>({
			content_type: "authors",
		});

		const tags = await Promise.all(
			raw.map(async (tag) => {
				const { items: rawArticlesByTag } = await client.getEntries({
					content_type: "articles",
					"fields.tags.sys.id": tag.sys.id,
					order: ["-fields.publishDate"],
				});

				const articles = articleDTO.render(rawArticlesByTag as unknown as RawArticle[]);

				return {
					name: tag.fields.name as unknown as string,
					slug: tag.fields.slug,
					type: TagType.TAG,
					count: articles.length,
					articles,
				};
			}),
		);

		const authors = (await authorDTO.render(rawAuthors as unknown as RawAuthor[])).map((author) => ({
			name: author.name,
			slug: author.slug,
			type: TagType.AUTHOR,
			count: author.articles.length,
			articles: author.articles,
		}));

		return groupBy({
			array: [...tags, ...authors],
			keyFn: ({ name }) => name.charAt(0).toUpperCase(),
		}) as unknown as TagDTO;
	},
};
