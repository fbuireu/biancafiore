import type { BaseDTO } from '@shared/application/dto/baseDTO.ts';
import type { CityDTO, RawCity } from '@application/dto/city/types.ts';
import { createImage } from '@shared/application/dto/utils/createImage';
import type { ContenfulLocation } from '@shared/application/types';
import { parseDates } from '@application/dto/city/utils/parseDates';

export const cityDTO: BaseDTO<RawCity[], CityDTO[]> = {
	render: (raw) => {
		return raw.map((city) => {
			const coordinates = {
				latitude: (city.fields.coordinates as unknown as ContenfulLocation["fields"]["coordinates"]).lat,
				longitude: (city.fields.coordinates as unknown as ContenfulLocation["fields"]["coordinates"]).lon,
			};

			const { startDate, endDate } = parseDates({
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
