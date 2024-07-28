import type { CityDTO } from "@application/dto/city/types.ts";

interface CalculateCenterReturnType {
	latitude: number;
	longitude: number;
}

export function calculateCenter(data: CityDTO[]): CalculateCenterReturnType {
	const latitudes = data.map(({ coordinates }) => Number.parseFloat(String(coordinates.latitude)));
	const longitudes = data.map(({ coordinates }) => Number.parseFloat(String(coordinates.longitude)));

	const centerLatitude = latitudes.reduce((acc, latitude) => acc + latitude, 0) / latitudes.length;
	const centerLongitude = longitudes.reduce((acc, longitude) => acc + longitude, 0) / longitudes.length;

	return { latitude: centerLatitude, longitude: centerLongitude };
}
