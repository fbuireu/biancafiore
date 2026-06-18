import type { ArticleDTO } from "@application/dto/article/types";
import type { TagDTO } from "@application/dto/tag/types";
import { getAuthors } from "@application/dto/tag/utils/getAuthors";
import { getTags } from "@application/dto/tag/utils/getTags";
import type { BaseDTO } from "@shared/application/dto/baseDTO";
import type { Reference } from "@shared/application/types";
import { groupBy } from "./utils/groupBy";

export interface TagDTOInput {
	articles: ArticleDTO[];
	authors: Array<{ name: string; slug: string; articles: Reference<"articles">[] }>;
}

/**
 * Builds the A–Z index for the `/tags` page by merging the `tag` taxonomy
 * (derived from the articles' resolved terms) with author entries.
 */
export const tagDTO: BaseDTO<TagDTOInput, TagDTO> = {
	create: ({ articles, authors }) => {
		const tags = getTags(articles);
		const authorTags = getAuthors(authors);

		return groupBy({
			array: [...tags, ...authorTags],
			keyFn: ({ name }) => name.charAt(0).toUpperCase(),
		}) as TagDTO;
	},
};
