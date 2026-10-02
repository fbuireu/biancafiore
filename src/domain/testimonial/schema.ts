import { z } from "astro/zod";
import { imageSchema } from "../shared/image";

export const testimonialSchema = z.object({
	quotee: z.string(),
	quote: z.string(),
	image: imageSchema,
	role: z.string(),
});
