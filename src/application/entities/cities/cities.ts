import { defineCollection } from "astro:content";
import { citySchema } from "@domain/city";
import { createCities } from "../../dto/city";
import type { CitySkeleton } from "../../dto/city/types";
import { cmsCollection } from "../collection";

export const cities = defineCollection({
	loader: cmsCollection<CitySkeleton, ReturnType<typeof createCities>[number], "image">({
		query: { content_type: "city", order: ["fields.startDate"] },
		map: createCities,
		imageField: "image",
		identify: (city) => city.name,
	}),
	schema: citySchema,
});
