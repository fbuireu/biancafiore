import { z } from "astro:content";
import { imageSchema } from "@shared/application/entities";

export const projectsSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	image: imageSchema,
});
