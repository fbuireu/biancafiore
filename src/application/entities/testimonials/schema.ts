import { imageSchema } from "@shared/application/entities";
import { z } from "astro/zod";

export const testimonialsSchema = z.object({
	author: z.string(),
	quote: z.string(),
	image: imageSchema,
	role: z.string(),
});
