import { reference } from "astro:content";
import { z } from "@shared/utils/zod";
import { TagType } from "./types";

export const tagSchema = z.object({
	name: z.string(),
	slug: z.string(),
});

export const tagIndexEntrySchema = tagSchema.extend({
	type: z.enum([TagType.TAG, TagType.AUTHOR]),
	articles: z.array(reference("articles")),
});
