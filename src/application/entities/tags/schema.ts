import { z } from "astro:content";

export const tagSchema = z.object({
	name: z.string(),
	slug: z.string(),
});
