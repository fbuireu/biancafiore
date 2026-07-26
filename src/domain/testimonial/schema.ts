import { imageSchema } from "@domain/shared/image";
import { z } from "astro/zod";

export const testimonialsSchema = z.object({
	author: z.string(),
	quote: z.string(),
	image: imageSchema,
	role: z.string(),
});
