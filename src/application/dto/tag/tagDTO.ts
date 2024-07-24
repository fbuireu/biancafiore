import { articleDTO } from "@application/dto/article";
import type { RawArticle } from "@application/dto/article/types";
import { authorDTO } from "@application/dto/author";
import type { RawAuthor } from "@application/dto/author/types";
import type { RawTag, TagDTO } from "@application/dto/tag/types";
import { client } from "@lib/contentful.ts";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import { createAuthor } from "./utils/createAuthor";
import { createTag } from "./utils/createTag";
import { groupBy } from "./utils/groupBy";

export const tagDTO: BaseDTO<RawTag[], Promise<TagDTO>> = {
	render: async (raw) => {
		const { items: rawAuthors } = await client.getEntries<RawAuthor>({
			content_type: "authors",
		});
		const articles = articleDTO.render(
			(await client.getEntries<RawArticle>({ content_type: "articles" })).items as unknown as RawArticle[],
		);

		const authors = (await authorDTO.render(rawAuthors as unknown as RawAuthor[])).map((author) =>
			createAuthor({ author, articles }),
		);

		const tags = [...raw.map((tag) => createTag({ tag, articles })), ...authors];

		return groupBy({ array: tags, keyFn: ({ name }) => name.charAt(0).toUpperCase() });
	},
};
