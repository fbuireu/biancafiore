import { type CityDTO, citySchema } from "@domain/city";
import { fetchEntries } from "@infrastructure/cms/entries";
import { createCities } from "../../dto/city";
import type { RawCity } from "../../dto/city/types";
import { contentLoader } from "../collection";

export const cities = {
	loader: contentLoader<CityDTO>({
		name: "cities",
		load: async () => {
			const [rawCities] = await fetchEntries<[RawCity]>({ collection: "cities", orderBy: "start_date", order: "asc" });

			return createCities(rawCities);
		},
		identify: (city) => city.name,
	}),
	schema: citySchema,
};
