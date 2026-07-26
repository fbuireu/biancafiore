import { imageSchema } from "@domain/shared/image";
import { z } from "astro/zod";

export const projectsSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	image: imageSchema,
});
