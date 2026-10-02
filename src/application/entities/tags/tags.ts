import { defineCollection } from "astro:content";
import { tagIndexEntrySchema } from "@domain/tag";
import { fetchEntries } from "@infrastructure/cms/entries";
import type { ArticleSkeleton } from "../../dto/article/types";
import type { AuthorSkeleton } from "../../dto/author/types";
import { createTagIndex } from "../../dto/tag";
import type { TagSkeleton } from "../../dto/tag/types";
import { TAG_INDEX_ARTICLE_FIELDS, TAG_INDEX_AUTHOR_FIELDS } from "../../dto/tag/utils/tags";

export const tags = defineCollection({
	loader: async () => {
		const [rawTags, rawArticles, rawAuthors] = await fetchEntries<[TagSkeleton, ArticleSkeleton, AuthorSkeleton]>(
			{ content_type: "tag" },
			{ content_type: "article", select: TAG_INDEX_ARTICLE_FIELDS },
			{ content_type: "author", select: TAG_INDEX_AUTHOR_FIELDS },
		);

		return createTagIndex({ rawTags, rawArticles, rawAuthors }).map((tag) => ({ ...tag, id: tag.slug }));
	},
	schema: tagIndexEntrySchema,
});
