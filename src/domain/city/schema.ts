import { imageSchema } from "@domain/shared/image";
import { z } from "astro/zod";

export const citiesSchema = z.object({
	name: z.string(),
	slug: z.string(),
	coordinates: z.object({
		latitude: z.number(),
		longitude: z.number(),
	}),
	period: z.string(),
	description: z.string(),
	image: imageSchema,
});
