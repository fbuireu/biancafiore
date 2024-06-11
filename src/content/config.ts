import { defineCollection, reference, z } from "astro:content";

const articles = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		description: z.string(),
		publishDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		featuredImage: z.string().optional(),
		tags: z.string().array().optional(),
		author: reference("authors"),
		isFeatured: z.boolean(),
	}),
});

const authors = defineCollection({
	type: "content",
	schema: z.object({
		id: z.string(),
		name: z.string(),
		description: z.string(),
		jobTitle: z.string(),
		currentCompany: z.string(),
		profileImage: z.string().optional(),
		socialNetworks: z.string().array().optional(),
	}),
});

export const collections = { articles, authors };
