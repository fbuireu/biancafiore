import { reference } from "astro:content";
import { TagType } from "@domain/tag/types";
import { z } from "astro/zod";

export const tagSchema = z.object({
	name: z.string(),
	slug: z.string(),
});

export const tagIndexSchema = z.object({
	id: z.string(),
	name: z.string(),
	tags: z.array(
		tagSchema.extend({
			type: z.enum([TagType.TAG, TagType.AUTHOR]),
			count: z.number(),
			articles: z.array(reference("articles")),
		}),
	),
});
