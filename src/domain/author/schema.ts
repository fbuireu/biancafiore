import { z } from "@shared/utils/zod";
import { imageSchema } from "../shared/image";
import { referenceSchema } from "../shared/reference";
import { webUrlSchema } from "../shared/url";

export const authorSchema = z.object({
	name: z.string(),
	slug: z.string(),
	description: z.string(),
	jobTitle: z.string(),
	currentCompany: z.string(),
	profileImage: imageSchema,
	socialNetworks: z.array(webUrlSchema),
});

export const authorEntrySchema = authorSchema.extend({
	latestArticle: referenceSchema("articles").optional(),
});
