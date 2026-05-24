import { reference } from "astro:content";
import { z } from "astro/zod";
import { ArticleType } from "@application/dto/article/types";
import { authorSchema } from "@application/entities/authors";
import { tagSchema } from "@application/entities/tags/schema";
import { imageSchema } from "@shared/application/entities";

export const articleSchema = z.object({
	title: z.string(),
	author: authorSchema,
	slug: z.string(),
	description: z.string(),
	publishDate: z.string(),
	updatedAt: z.string(),
	featuredImage: imageSchema.optional(),
	isFeaturedArticle: z.boolean(),
	isRepublished: z.boolean().default(false),
	originalSource: z.string().optional(),
	variant: z.enum([ArticleType.NO_IMAGE, ArticleType.DEFAULT]),
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
			}),
		)
		.optional()
		.default([]),
});
