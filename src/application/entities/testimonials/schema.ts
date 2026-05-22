import { z } from "astro/zod";
import { imageSchema } from "@shared/application/entities";

export const testimonialsSchema = z.object({
	author: z.string(),
	quote: z.string(),
	image: imageSchema,
	role: z.string(),
});
