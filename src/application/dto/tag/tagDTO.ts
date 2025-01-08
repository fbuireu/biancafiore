import { getCollection } from "astro:content";
import type { RawTag, TagDTO } from "@application/dto/tag/types";
import { getAuthors } from "@application/dto/tag/utils/getAuthors";
import { getTags } from "@application/dto/tag/utils/getTags";
import type { BaseDTO } from "@shared/application/dto/baseDTO";

export const tagDTO: BaseDTO<RawTag[], Promise<TagDTO>> = {
	create: async (raw) => {
		const articles = await getCollection("articles");

		const [tags, authors] = await Promise.all([getTags({ rawTags: raw, articles }), getAuthors()]);

		return Object.groupBy([...tags, ...authors], ({ name }) => name.charAt(0).toUpperCase()) as TagDTO;
	},
};
