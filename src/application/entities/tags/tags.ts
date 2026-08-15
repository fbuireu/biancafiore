import { defineCollection } from "astro:content";
import type { ArticleSkeleton } from "@application/dto/article/types";
import type { AuthorSkeleton } from "@application/dto/author/types";
import { tagDTO } from "@application/dto/tag";
import type { TagSkeleton } from "@application/dto/tag/types";
import { tagIndexEntrySchema } from "@domain/tag";
import { fetchEntries } from "@infrastructure/cms/entries";

export const tags = defineCollection({
	loader: async () => {
		const [rawTags, rawArticles, rawAuthors] = await fetchEntries<[TagSkeleton, ArticleSkeleton, AuthorSkeleton]>(
			{ content_type: "tag" },
			{
				content_type: "article",
				select: ["fields.slug", "fields.tags", "fields.author", "fields.isFavorite", "fields.publishDate"],
			},
			{ content_type: "author", select: ["fields.name", "fields.slug"] },
		);

		return tagDTO.create([rawTags, rawArticles, rawAuthors]).map((tag) => ({
			id: tag.slug,
			...tag,
		}));
	},
	schema: tagIndexEntrySchema,
});
