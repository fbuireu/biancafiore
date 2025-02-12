import { getCollection } from "astro:content";
import type { RawTag, TagDTO } from "@application/dto/tag/types";
import { getAuthors } from "@application/dto/tag/utils/getAuthors";
import { getTags } from "@application/dto/tag/utils/getTags";
import type { BaseDTO } from "@shared/application/dto/baseDTO";
import { groupBy } from "./utils/groupBy";

export const tagDTO: BaseDTO<RawTag[], Promise<TagDTO>> = {
	create: async (raw) => {
		const articles = await getCollection("articles").catch(() => []);

		const tags = getTags({ rawTags: raw, articles });
		const authors = await getAuthors().catch(() => []);

		return groupBy({
			array: [...tags, ...authors],
			keyFn: ({ name }) => name.charAt(0).toUpperCase(),
		}) as TagDTO;
	},
};
