import type { CityDTO, RawCity } from "@application/dto/city/types";
import type { BaseDTO } from "@shared/application/dto/baseDTO";
import { createImage } from "@shared/application/dto/utils/createImage";
import type { EmDashEntry } from "@shared/application/types";
import { createDate } from "./utils/createDate";

export const cityDTO: BaseDTO<EmDashEntry<RawCity>[], CityDTO[]> = {
	create: (raw) => {
		return raw.map((entry) => {
			const city = entry.data;
			const coordinates = {
				latitude: city.coordinates.lat,
				longitude: city.coordinates.lon,
			};

			const { startDate, endDate } = createDate({
				startDate: String(city.startDate),
				...(city.endDate && { endDate: String(city.endDate) }),
			});

			return {
				name: city.name,
				coordinates,
				period: `${startDate}-${endDate}`,
				description: city.description,
				image: createImage(city.image),
			} as unknown as CityDTO;
		});
	},
};
