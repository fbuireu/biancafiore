import { defineCollection } from "astro:content";
import { createCities } from "@application/dto/city";
import type { CitySkeleton } from "@application/dto/city/types";
import { withImagePlaceholders } from "@application/entities/placeholders";
import { citiesSchema } from "@domain/city";
import { fetchEntries } from "@infrastructure/cms/entries";

export const cities = defineCollection({
	loader: async () => {
		const [rawCities] = await fetchEntries<[CitySkeleton]>({
			content_type: "city",
			order: ["fields.startDate"],
		});

		const cities = await withImagePlaceholders({ field: "image", entries: createCities(rawCities) });

		return cities.map((city) => ({ id: city.name, ...city }));
	},
	schema: citiesSchema,
});
