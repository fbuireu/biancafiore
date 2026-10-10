import { MEDIA_FILE_PATH } from "@infrastructure/cms/media";
import { rawEntry, rawImage } from "@tests/doubles/cmsEntries";
import { describe, expect, it } from "vitest";
import { createCities } from ".";
import type { CityFields } from "./types";

const makeCity = (fields: Partial<CityFields> = {}) =>
	rawEntry<CityFields>({
		data: {
			name: "Barcelona",
			latitude: 41.3874,
			longitude: 2.1686,
			start_date: "2019-06-01",
			description: "Two summers by the sea",
			image: rawImage({ name: "city.jpg", width: 1600, height: 900 }),
			...fields,
		},
	});

describe("createCities coordinates", () => {
	it("carries the latitude and longitude across as the domain's coordinates", () => {
		const [city] = createCities([makeCity({ latitude: 41.3874, longitude: 2.1686 })]);

		expect(city.coordinates).toEqual({ latitude: 41.3874, longitude: 2.1686 });
	});

	it("keeps a zero coordinate instead of dropping it as falsy", () => {
		const [city] = createCities([makeCity({ latitude: 0, longitude: 0 })]);

		expect(city.coordinates).toEqual({ latitude: 0, longitude: 0 });
	});
});

describe("createCities slug", () => {
	it("derives the slug from the name, since a City addresses no page of its own", () => {
		expect(createCities([makeCity({ name: "Buenos Aires" })])[0].slug).toBe("buenos-aires");
	});

	it("strips the diacritics and the punctuation a city name may carry", () => {
		expect(createCities([makeCity({ name: "São Paulo, Brazil" })])[0].slug).toBe("sao-paulo-brazil");
	});
});

describe("createCities name", () => {
	it("trims the name the CMS padded, since the cities collection is keyed on it", () => {
		const [city] = createCities([makeCity({ name: "  Barcelona\n" })]);

		expect(city).toMatchObject({ name: "Barcelona", slug: "barcelona" });
	});
});

describe("createCities, given a Period it cannot read", () => {
	it("refuses it by naming the City, since the date alone points at no entry", () => {
		expect(() => createCities([makeCity({ name: "Lisbon", start_date: "not-a-date" })])).toThrow(
			'The City "Lisbon" has an unreadable Period (start not-a-date, end open), so About cannot say when the Author lived there',
		);
	});

	it("says which end it could not read when the Period is closed", () => {
		expect(() => createCities([makeCity({ name: "Lisbon", start_date: "2019-01-01", end_date: "someday" })])).toThrow(
			'The City "Lisbon" has an unreadable Period (start 2019-01-01, end someday)',
		);
	});

	it("keeps the domain's own refusal as the cause", () => {
		expect(() => createCities([makeCity({ start_date: "not-a-date" })])).toThrow(
			expect.objectContaining({
				cause: expect.objectContaining({ message: "A City reached the mapper with an unreadable date: not-a-date" }),
			}),
		);
	});
});

describe("createCities period", () => {
	it("keeps the years of a closed period, leaving the hyphenated label to formatPeriod", () => {
		const [city] = createCities([makeCity({ start_date: "2019-06-01", end_date: "2021-09-30" })]);

		expect(city.period).toEqual({ startYear: 2019, endYear: 2021 });
	});

	it("leaves the end of a period open when the CMS has no end date", () => {
		expect(createCities([makeCity({ start_date: "2022-01-15" })])[0].period).toEqual({ startYear: 2022 });
	});

	it("treats an empty end date as an open period too, because the field is spread only when truthy", () => {
		expect(createCities([makeCity({ start_date: "2022-01-15", end_date: "" })])[0].period).toEqual({
			startYear: 2022,
		});
	});
});

describe("createCities passthrough fields", () => {
	it("keeps the name and description verbatim and maps the image to url, dimensions and formats", () => {
		const [city] = createCities([
			makeCity({ image: rawImage({ name: "barcelona.webp", mimeType: "image/webp", width: 800, height: 600 }) }),
		]);

		expect(city).toMatchObject({
			name: "Barcelona",
			description: "Two summers by the sea",
			image: {
				url: `${MEDIA_FILE_PATH}barcelona.webp`,
				details: { width: 800, height: 600 },
				formats: { avif: false, webp: true },
				shareCrops: expect.any(Array),
			},
		});
	});

	it("maps an empty batch to an empty array synchronously, with no promise in sight", () => {
		const result = createCities([]);

		expect(result).toEqual([]);
		expect(result).not.toBeInstanceOf(Promise);
	});

	it("preserves the order of the batch it was given", () => {
		const cities = createCities([makeCity({ name: "Lisbon" }), makeCity({ name: "Berlin" })]);

		expect(cities.map(({ name }) => name)).toEqual(["Lisbon", "Berlin"]);
	});
});
