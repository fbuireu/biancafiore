import { type TagIndexEntryDTO, tagIndexEntrySchema } from "@domain/tag";
import { createTagIndex } from "../../dto/tag";
import { contentLoader } from "../collection";
import { fetchArticlesAndAuthors } from "../queries";

export const tags = {
	loader: contentLoader<TagIndexEntryDTO>({
		name: "tags",
		load: async () => {
			const [rawArticles, rawAuthors] = await fetchArticlesAndAuthors();

			return createTagIndex({ rawArticles, rawAuthors });
		},
		identify: (tag) => tag.slug,
	}),
	schema: tagIndexEntrySchema,
};
