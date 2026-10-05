import { z } from "@shared/utils/zod";

const COUNTRIES_URL = "/countries.json";

const countryFeatureSchema = z.object({
	type: z.literal("Feature"),
	properties: z.record(z.string(), z.unknown()),
	geometry: z.object({
		type: z.enum(["Polygon", "MultiPolygon"]),
		coordinates: z.array(z.unknown()),
	}),
});

const countriesSchema = z.object({ features: z.array(countryFeatureSchema) });

export type CountryFeature = z.input<typeof countryFeatureSchema>;

export const fetchCountries = async (): Promise<CountryFeature[]> => {
	try {
		const response = await fetch(COUNTRIES_URL);
		const countries: unknown = await response.json();

		return countriesSchema.validate(countries) ? countries.features : [];
	} catch {
		return [];
	}
};
