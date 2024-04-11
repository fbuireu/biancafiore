import type { CityValue } from "@components/atoms/worldGlobe";

interface CalculateCenterReturnType {
	latitude: number;
	longitude: number;
}

export function calculateCenter(data: CityValue[]): CalculateCenterReturnType {
	const latitudes = data.map((point) => Number.parseFloat(point.latitude));
	const longitudes = data.map((point) => Number.parseFloat(point.longitude));

	const centerLatitude =
		latitudes.reduce((acc, latitude) => acc + latitude, 0) / latitudes.length;
	const centerLongitude =
		longitudes.reduce((acc, longitude) => acc + longitude, 0) /
		longitudes.length;

	return { latitude: centerLatitude, longitude: centerLongitude };
}
