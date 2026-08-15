import { defineCollection, reference } from "astro:content";
import type { ArticleSkeleton } from "@application/dto/article/types";
import { authorDTO } from "@application/dto/author";
import type { AuthorSkeleton } from "@application/dto/author/types";
import { authorSchema } from "@domain/author";
import { fetchEntries } from "@infrastructure/cms/entries";
import { z } from "astro/zod";

export const authors = defineCollection({
	loader: async () => {
		const [rawAuthors, rawArticles] = await fetchEntries<[AuthorSkeleton, ArticleSkeleton]>(
			{ content_type: "author" },
			{ content_type: "article", order: ["-fields.publishDate"] },
		);

		const authors = authorDTO.create([rawAuthors, rawArticles]);

		return authors.map((author) => ({
			id: author.name,
			...author,
		}));
	},
	schema: authorSchema.extend({
		articles: z.array(reference("articles")).optional(),
		latestArticle: reference("articles").optional(),
	}),
});
