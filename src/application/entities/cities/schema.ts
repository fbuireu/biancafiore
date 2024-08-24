import { z } from "astro:content";
import { imageSchema } from "@shared/application/entities";

export const citiesSchema = z.object({
	name: z.string(),
	coordinates: z.object({
		latitude: z.number(),
		longitude: z.number(),
	}),
	period: z.string(),
	description: z.string(),
	image: imageSchema,
});
