import type { citiesSchema } from "@application/entities/cities";
import type { EmDashImageField, GeoCoordinates } from "@shared/application/types";
import type { z } from "astro/zod";

/** `data` payload of an EmDash `cities` entry. */
export interface RawCity {
	name: string;
	coordinates: GeoCoordinates;
	startDate: string;
	endDate?: string;
	description: string;
	image?: EmDashImageField;
}

export type CityDTO = z.infer<typeof citiesSchema>;
