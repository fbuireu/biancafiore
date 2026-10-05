import { reference } from "astro:content";
import { z } from "astro/zod";
import { imageSchema } from "../shared/image";

export const authorSchema = z.object({
	name: z.string(),
	slug: z.string(),
	description: z.string(),
	jobTitle: z.string(),
	currentCompany: z.string(),
	profileImage: imageSchema,
	socialNetworks: z.array(z.url()),
});

export const authorEntrySchema = authorSchema.extend({
	latestArticle: reference("articles").optional(),
});
