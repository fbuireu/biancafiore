import { z } from "astro:content";

export const imageSchema = z.object({
	url: z.string(),
	details: z.object({
		width: z.number(),
		height: z.number(),
	}),
	formats: z.object({
		avif: z.boolean(),
		webp: z.boolean(),
	}),
});
