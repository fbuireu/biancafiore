import type { CollectionEntry } from "astro:content";
import type { ReactGlobePoint } from "@modules/about/components/worldGlobe";

export function refineCities(cities: CollectionEntry<"cities">[]): ReactGlobePoint[] {
	return cities.map(({ data }) => ({
		lat: data.coordinates.latitude,
		lng: data.coordinates.longitude,
		label: data.name,
	}));
}
