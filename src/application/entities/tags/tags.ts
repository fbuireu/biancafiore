import { defineCollection } from "astro:content";
import type { ArticleSkeleton } from "@application/dto/article/types";
import type { AuthorSkeleton } from "@application/dto/author/types";
import { createTagIndex } from "@application/dto/tag";
import type { TagSkeleton } from "@application/dto/tag/types";
import { TAG_INDEX_ARTICLE_FIELDS, TAG_INDEX_AUTHOR_FIELDS } from "@application/dto/tag/utils/tags";
import { tagIndexEntrySchema } from "@domain/tag";
import { fetchEntries } from "@infrastructure/cms/entries";

export const tags = defineCollection({
	loader: async () => {
		const [rawTags, rawArticles, rawAuthors] = await fetchEntries<[TagSkeleton, ArticleSkeleton, AuthorSkeleton]>(
			{ content_type: "tag" },
			{ content_type: "article", select: TAG_INDEX_ARTICLE_FIELDS },
			{ content_type: "author", select: TAG_INDEX_AUTHOR_FIELDS },
		);

		return createTagIndex({ rawTags, rawArticles, rawAuthors }).map((tag) => ({ id: tag.slug, ...tag }));
	},
	schema: tagIndexEntrySchema,
});
