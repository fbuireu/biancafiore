import type { RawCity } from "@application/dto/city/types";
import { createImage } from "@application/dto/shared/images";
import { type CityDTO, createPeriod } from "@domain/city";
import { slugify } from "@shared/utils/strings";

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
