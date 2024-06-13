import type { City } from "@components/atoms/worldGlobe";

interface CalculateCenterReturnType {
	latitude: number;
	longitude: number;
}

export function calculateCenter(data: City[]): CalculateCenterReturnType {
	const latitudes = data.map(({ latitude }) => Number.parseFloat(latitude));
	const longitudes = data.map(({ longitude }) => Number.parseFloat(longitude));

	const centerLatitude = latitudes.reduce((acc, latitude) => acc + latitude, 0) / latitudes.length;
	const centerLongitude = longitudes.reduce((acc, longitude) => acc + longitude, 0) / longitudes.length;

	return { latitude: centerLatitude, longitude: centerLongitude };
}
