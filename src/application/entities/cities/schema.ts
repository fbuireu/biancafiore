import { imageSchema } from "@shared/application/entities";
import { z } from "astro/zod";

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
