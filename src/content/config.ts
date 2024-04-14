import { defineCollection, z } from "astro:content";

const articles = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		description: z.string(),
		publishDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		featuredImage: z.string().optional(),
		tags: z.string().array().optional(),
		author: z.string(),
		isFeatured: z.boolean(),
	}),
});

export const collections = { articles };
