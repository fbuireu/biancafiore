import { defineCollection } from "astro:content";
import { cityDTO } from "@application/dto/city";
import type { RawCity } from "@application/dto/city/types";
import { citiesSchema } from "@application/entities/cities/schema";
import { createContentfulClient } from "@infrastructure/cms/client";

export const cities = defineCollection({
	loader: async () => {
		if (!process.env.CONTENTFUL_SPACE_ID) return [];
		const client = await createContentfulClient();
		const { items: rawCities } = await client.getEntries<RawCity>({
			content_type: "city",
			order: ["fields.startDate"],
		});
		const cities = cityDTO.create(rawCities as unknown as RawCity[]);

		return cities.map((city) => ({
			id: city.name,
			...city,
		}));
	},
	schema: citiesSchema,
});
