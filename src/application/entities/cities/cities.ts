import { defineCollection } from "astro:content";
import { cityDTO } from "@application/dto/city";
import type { RawCity } from "@application/dto/city/types.ts";
import { citiesSchema } from "@application/entities/cities/schema.ts";
import { client } from "@infrastructure/cms/client.ts";

export const cities = defineCollection({
	loader: async () => {
		const { items: rawCities } = await client.getEntries<RawCity>({
			content_type: "city",
			order: ["fields.startDate"],
		});
		const cities = cityDTO.render(rawCities as unknown as RawCity[]);

		return cities.map((city) => ({
			id: city.name,
			...city,
		}));
	},
	schema: citiesSchema,
});
