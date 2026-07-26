import type { RawCity } from "@application/dto/city/types";
import { type CityDTO, formatPeriod } from "@domain/city";
import type { BaseDTO } from "@domain/shared/baseDTO";
import { createImage } from "@shared/application/dto/utils/images";
import { slugify } from "@shared/utils/strings";

export const cityDTO: BaseDTO<RawCity[], CityDTO[]> = {
	create: (raw) => {
		return raw.map((rawCity): CityDTO => {
			const coordinates = {
				latitude: rawCity.fields.coordinates.lat,
				longitude: rawCity.fields.coordinates.lon,
			};

			return {
				name: rawCity.fields.name,
				slug: slugify(rawCity.fields.name),
				coordinates,
				period: formatPeriod({
					startDate: String(rawCity.fields.startDate),
					...(rawCity.fields.endDate && { endDate: String(rawCity.fields.endDate) }),
				}),
				description: rawCity.fields.description,
				image: createImage(rawCity.fields.image),
			};
		});
	},
};
