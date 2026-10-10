import { z } from "@shared/utils/zod";
import { authorSchema } from "../author";
import { imageSchema } from "../shared/image";
import { referenceSchema } from "../shared/reference";
import { tagSchema } from "../tag";

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
	relatedArticles: z.array(referenceSchema("articles")).default([]),
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
