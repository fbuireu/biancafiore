import type { RawTag, TagDTO } from "@application/dto/tag/types";
import { getAuthors } from "@application/dto/tag/utils/getAuthors";
import { getTags } from "@application/dto/tag/utils/getTags";
import type { BaseDTO } from "@shared/application/dto/baseDTO";
import type { Entry, EntrySkeletonType } from "contentful";
import { groupBy } from "./utils/groupBy";

export const tagDTO: BaseDTO<[RawTag[], Entry<EntrySkeletonType>[], Entry<EntrySkeletonType>[]], Promise<TagDTO>> = {
	create: async ([raw, rawArticles, rawAuthors]) => {
		const tags = getTags({ rawTags: raw, rawArticles });
		const authors = getAuthors({ rawAuthors, rawArticles });

		return groupBy({
			array: [...tags, ...authors],
			keyFn: ({ name }) => name.charAt(0).toUpperCase(),
		}) as TagDTO;
	},
};
