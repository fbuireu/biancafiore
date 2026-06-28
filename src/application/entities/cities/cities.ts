import { defineCollection } from "astro:content";
import { cityDTO } from "@application/dto/city";
import type { RawCity } from "@application/dto/city/types";
import { citiesSchema } from "@application/entities/cities/schema";
import { CmsClient, isContentfulConfigured } from "@infrastructure/cms/client";
import { runCms } from "@infrastructure/runtime";
import { Effect } from "effect";

export const cities = defineCollection({
	loader: async () => {
		if (!isContentfulConfigured()) return [];

		const { items: rawCities } = await runCms(
			Effect.gen(function* () {
				const cms = yield* CmsClient;
				return yield* cms.getEntries({
					content_type: "city",
					order: ["fields.startDate"],
				});
			}),
		);

		const cities = cityDTO.create(rawCities as unknown as RawCity[]);

		return cities.map((city) => ({
			id: city.name,
			...city,
		}));
	},
	schema: citiesSchema,
});
