import type { City } from "@components/atoms/worldGlobe";

export interface ReactGlobePoint {
	lat: string;
	lng: string;
	label: string;
}

export function refineCities(cities: City[]): ReactGlobePoint[] {
	return cities.map(({ latitude, longitude, name }) => ({
		lat: latitude,
		lng: longitude,
		label: name,
	}));
}
