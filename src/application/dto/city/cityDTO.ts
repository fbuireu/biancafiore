import { type CityDTO, type CityPeriod, createPeriod } from "@domain/city";
import { slugify } from "@shared/utils/strings";
import { createImage } from "../shared/images";
import type { RawCity } from "./types";

const nameOf = (rawCity: RawCity): string => rawCity.fields.name.trim();

function periodOf(rawCity: RawCity): CityPeriod {
	const startDate = String(rawCity.fields.startDate);
	const endDate = rawCity.fields.endDate ? String(rawCity.fields.endDate) : undefined;

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
	return raw.map((rawCity): CityDTO => {
		const coordinates = {
			latitude: rawCity.fields.coordinates.lat,
			longitude: rawCity.fields.coordinates.lon,
		};

		return {
			name: nameOf(rawCity),
			slug: slugify(nameOf(rawCity)),
			coordinates,
			period: periodOf(rawCity),
			description: rawCity.fields.description,
			image: createImage(rawCity.fields.image),
		};
	});
}
