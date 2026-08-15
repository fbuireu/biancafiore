import { reference } from "astro:content";
import { TagType } from "@domain/tag/types";
import { z } from "astro/zod";

export const tagSchema = z.object({
	name: z.string(),
	slug: z.string(),
});

export const tagIndexEntrySchema = tagSchema.extend({
	type: z.enum([TagType.TAG, TagType.AUTHOR]),
	articles: z.array(reference("articles")),
});
