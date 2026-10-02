import { type CityDTO, createPeriod } from "@domain/city";
import { slugify } from "@shared/utils/strings";
import { createImage } from "../shared/images";
import type { RawCity } from "./types";

export function createCities(raw: RawCity[]): CityDTO[] {
	return raw.map((rawCity): CityDTO => {
		const coordinates = {
			latitude: rawCity.fields.coordinates.lat,
			longitude: rawCity.fields.coordinates.lon,
		};

		return {
			name: rawCity.fields.name,
			slug: slugify(rawCity.fields.name),
			coordinates,
			period: createPeriod({
				startDate: String(rawCity.fields.startDate),
				...(rawCity.fields.endDate && { endDate: String(rawCity.fields.endDate) }),
			}),
			description: rawCity.fields.description,
			image: createImage(rawCity.fields.image),
		};
	});
}
