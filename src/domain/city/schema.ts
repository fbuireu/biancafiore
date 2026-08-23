import { imageSchema } from "@domain/shared/image";
import { z } from "astro/zod";

export const cityPeriodSchema = z.object({
	startYear: z.number(),
	endYear: z.number().optional(),
});

export const citiesSchema = z.object({
	name: z.string(),
	slug: z.string(),
	coordinates: z.object({
		latitude: z.number(),
		longitude: z.number(),
	}),
	period: cityPeriodSchema,
	description: z.string(),
	image: imageSchema,
});
