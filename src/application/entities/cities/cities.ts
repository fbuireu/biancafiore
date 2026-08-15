import { defineCollection } from "astro:content";
import { cityDTO } from "@application/dto/city";
import type { CitySkeleton } from "@application/dto/city/types";
import { citiesSchema } from "@domain/city";
import { fetchEntries } from "@infrastructure/cms/entries";
import { getImagePlaceholders } from "@infrastructure/images/imagePlaceholder";

export const cities = defineCollection({
	loader: async () => {
		const [rawCities] = await fetchEntries<[CitySkeleton]>({
			content_type: "city",
			order: ["fields.startDate"],
		});

		const cities = cityDTO.create(rawCities);

		const placeholders = await getImagePlaceholders(cities.map(({ image }) => image.url));

		return cities.map((city) => ({
			id: city.name,
			...city,
			image: { ...city.image, placeholder: placeholders.get(city.image.url) },
		}));
	},
	schema: citiesSchema,
});
