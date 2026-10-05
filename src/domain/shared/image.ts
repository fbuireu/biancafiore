import { z } from "@shared/utils/zod";

export const imageSchema = z.object({
	url: z.url(),
	details: z.object({
		width: z.number(),
		height: z.number(),
	}),
	formats: z.object({
		avif: z.boolean(),
		webp: z.boolean(),
	}),
	placeholder: z.string().optional(),
	shareCrops: z.array(z.string()).default([]),
});

export type ImageDTO = z.infer<typeof imageSchema>;
