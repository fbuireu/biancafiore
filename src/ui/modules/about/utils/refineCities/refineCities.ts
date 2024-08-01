import type { CityDTO } from "@application/dto/city/types.ts";
import type { ReactGlobePoint } from "@modules/about/components/worldGlobe";

export function refineCities(cities: CityDTO[]): ReactGlobePoint[] {
	return cities.map(({ coordinates, name }) => ({
		lat: coordinates.latitude,
		lng: coordinates.longitude,
		label: name,
	}));
}
