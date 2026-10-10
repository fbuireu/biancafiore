import { type CityDTO, type CityPeriod, createPeriod } from "@domain/city";
import { slugify } from "@shared/utils/strings";
import { createImage } from "../shared/images";
import type { RawCity } from "./types";

const nameOf = (rawCity: RawCity): string => rawCity.data.name.trim();

function periodOf(rawCity: RawCity): CityPeriod {
	const startDate = String(rawCity.data.start_date);
	const endDate = rawCity.data.end_date ? String(rawCity.data.end_date) : undefined;

	try {
		return createPeriod({ startDate, ...(endDate && { endDate }) });
	} catch (cause) {
		throw new Error(
			`The City "${nameOf(rawCity)}" has an unreadable Period (start ${startDate}, end ${endDate ?? "open"}), so About cannot say when the Author lived there`,
			{ cause },
		);
	}
}

export function createCities(raw: RawCity[]): CityDTO[] {
	return raw.map(
		(rawCity): CityDTO => ({
			name: nameOf(rawCity),
			slug: slugify(nameOf(rawCity)),
			coordinates: {
				latitude: rawCity.data.latitude,
				longitude: rawCity.data.longitude,
			},
			period: periodOf(rawCity),
			description: rawCity.data.description,
			image: createImage(rawCity.data.image),
		}),
	);
}
