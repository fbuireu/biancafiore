import type { CityDTO, RawCity } from "@application/dto/city/types";
import type { BaseDTO } from "@shared/application/dto/baseDTO";
import { createImage } from "@shared/application/dto/utils/createImage";
import type { ContenfulLocation } from "@shared/application/types";
import { createDate } from "./utils/createDate";

export const cityDTO: BaseDTO<RawCity[], CityDTO[]> = {
	create: (raw) => {
		return raw.map((rawCity) => {
			const coordinates = {
				latitude: (rawCity.fields.coordinates as unknown as ContenfulLocation["fields"]["coordinates"]).lat,
				longitude: (rawCity.fields.coordinates as unknown as ContenfulLocation["fields"]["coordinates"]).lon,
			};

			const { startDate, endDate } = createDate({
				startDate: String(rawCity.fields.startDate),
				...(rawCity.fields.endDate && { endDate: String(rawCity.fields.endDate) }),
			});

			return {
				name: rawCity.fields.name,
				coordinates,
				period: `${startDate}-${endDate}`,
				description: rawCity.fields.description,
				image: createImage(rawCity.fields.image),
			} as unknown as CityDTO;
		});
	},
};
