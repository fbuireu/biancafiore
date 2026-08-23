import { defineCollection } from "astro:content";
import { createCities } from "@application/dto/city";
import type { CitySkeleton } from "@application/dto/city/types";
import { cmsCollection } from "@application/entities/collection";
import { citiesSchema } from "@domain/city";

export const cities = defineCollection({
	loader: cmsCollection<CitySkeleton, ReturnType<typeof createCities>[number], "image">({
		query: { content_type: "city", order: ["fields.startDate"] },
		map: createCities,
		imageField: "image",
		identify: (city) => city.name,
	}),
	schema: citiesSchema,
});
