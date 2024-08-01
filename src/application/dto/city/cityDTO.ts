import type { CityDTO, RawCity } from "@application/dto/city/types.ts";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import { createImage } from "@shared/application/dto/utils/createImage";
import type { ContenfulLocation } from "@shared/application/types";
import { createDate } from "./utils/createDate";

export const cityDTO: BaseDTO<RawCity[], CityDTO[]> = {
	render: (raw) => {
		return raw.map((city) => {
			const coordinates = {
				latitude: (city.fields.coordinates as unknown as ContenfulLocation["fields"]["coordinates"]).lat,
				longitude: (city.fields.coordinates as unknown as ContenfulLocation["fields"]["coordinates"]).lon,
			};

			const { startDate, endDate } = createDate({
				startDate: String(city.fields.startDate),
				...(city.fields.endDate && { endDate: String(city.fields.endDate) }),
			});

			return {
				name: city.fields.name,
				coordinates,
				period: `${startDate}-${endDate}`,
				description: city.fields.description,
				image: createImage(city.fields.image),
			} as unknown as CityDTO;
		});
	},
};
