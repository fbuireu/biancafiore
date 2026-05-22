import { z } from "astro/zod";

export const tagSchema = z.object({
	name: z.string(),
	slug: z.string(),
});
