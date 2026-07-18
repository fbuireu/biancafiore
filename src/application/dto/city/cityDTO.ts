import type { CityDTO, RawCity } from "@application/dto/city/types";
import type { BaseDTO } from "@shared/application/dto/baseDTO";
import { createImage } from "@shared/application/dto/utils/images";
import { slugify } from "@shared/utils/strings";
import { createDate } from "./utils/dates";

export const cityDTO: BaseDTO<RawCity[], CityDTO[]> = {
	create: (raw) => {
		return raw.map((rawCity): CityDTO => {
			const coordinates = {
				latitude: rawCity.fields.coordinates.lat,
				longitude: rawCity.fields.coordinates.lon,
			};

			const { startDate, endDate } = createDate({
				startDate: String(rawCity.fields.startDate),
				...(rawCity.fields.endDate && { endDate: String(rawCity.fields.endDate) }),
			});

			return {
				name: rawCity.fields.name,
				slug: slugify(rawCity.fields.name),
				coordinates,
				period: `${startDate}-${endDate}`,
				description: rawCity.fields.description,
				image: createImage(rawCity.fields.image),
			};
		});
	},
};
