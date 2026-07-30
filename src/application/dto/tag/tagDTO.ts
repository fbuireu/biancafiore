import type { RawTag } from "@application/dto/tag/types";
import { getAuthors, getTags } from "@application/dto/tag/utils/tags";
import type { BaseDTO } from "@domain/shared/baseDTO";
import type { TagDTO } from "@domain/tag";
import { groupBy } from "@shared/utils/objects";
import type { Entry, EntrySkeletonType } from "contentful";

export const tagDTO: BaseDTO<[RawTag[], Entry<EntrySkeletonType>[], Entry<EntrySkeletonType>[]], TagDTO> = {
	create: ([raw, rawArticles, rawAuthors]) => {
		const tags = getTags({ rawTags: raw, rawArticles });
		const authors = getAuthors({ rawAuthors, rawArticles });

		return groupBy({
			array: [...tags, ...authors],
			keyFn: ({ name }) => name.charAt(0).toUpperCase(),
		}) as TagDTO;
	},
};
