import type { CollectionEntry } from "astro:content";

interface CalculateCenterReturnType {
	latitude: number;
	longitude: number;
}

export function calculateCenter(city: CollectionEntry<"cities">[]): CalculateCenterReturnType {
	const latitudes = city.map(({ data }) => Number.parseFloat(String(data.coordinates.latitude)));
	const longitudes = city.map(({ data }) => Number.parseFloat(String(data.coordinates.longitude)));

	const centerLatitude = latitudes.reduce((acc, latitude) => acc + latitude, 0) / latitudes.length;
	const centerLongitude = longitudes.reduce((acc, longitude) => acc + longitude, 0) / longitudes.length;

	return { latitude: centerLatitude, longitude: centerLongitude };
}
