import { imageSchema } from "@shared/application/entities";
import { z } from "astro/zod";

export const authorSchema = z.object({
	name: z.string(),
	slug: z.string(),
	description: z.string(),
	jobTitle: z.string(),
	currentCompany: z.string(),
	profileImage: imageSchema,
	socialNetworks: z.array(z.url()),
});
