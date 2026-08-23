import { reference } from "astro:content";
import { authorSchema } from "@domain/author";
import { imageSchema } from "@domain/shared/image";
import { tagSchema } from "@domain/tag";
import { z } from "astro/zod";

export const articleSchema = z.object({
	title: z.string(),
	author: authorSchema,
	slug: z.string(),
	description: z.string(),
	publishDateISO: z.string(),
	updatedAt: z.string(),
	featuredImage: imageSchema.optional(),
	isFeaturedArticle: z.boolean(),
	isFavorite: z.boolean().default(false),
	isRepublished: z.boolean().default(false),
	originalSource: z.string().optional(),
	content: z.string(),
	readingTime: z.number(),
	tags: z.array(tagSchema).optional(),
	relatedArticles: z.array(reference("articles")).default([]),
	tableOfContents: z
		.array(
			z.object({
				id: z.string(),
				heading: z.string(),
				level: z.number(),
				scope: z.string(),
			}),
		)
		.optional()
		.default([]),
});
