import { cityDTO } from "@application/dto/city";
import type { RawCity } from "@application/dto/city/types";
import { describe, expect, it } from "vitest";

interface AssetParams {
	url?: string;
	contentType?: string;
	width?: number;
	height?: number;
}

const asset = ({
	url = "//images.ctfassets.net/city.jpg",
	contentType = "image/jpeg",
	width = 1600,
	height = 900,
}: AssetParams = {}) => ({
	fields: { file: { url, contentType, details: { size: 2048, image: { width, height } } } },
});

interface MakeCityParams {
	name?: string;
	latitude?: number;
	longitude?: number;
	startDate?: string;
	endDate?: string;
	description?: string;
	image?: unknown;
}

const makeCity = ({
	name = "Barcelona",
	latitude = 41.3874,
	longitude = 2.1686,
	startDate = "2019-06-01",
	endDate,
	description = "Two summers by the sea",
	image = asset(),
}: MakeCityParams = {}) =>
	({
		fields: {
			name,
			coordinates: { lat: latitude, lon: longitude },
			startDate,
			endDate,
			description,
			image,
		},
	}) as unknown as RawCity;

describe("cityDTO coordinates", () => {
	it("renames Contentful's lat and lon to the domain's latitude and longitude", () => {
		const [city] = cityDTO.create([makeCity({ latitude: 41.3874, longitude: 2.1686 })]);

		expect(city.coordinates).toEqual({ latitude: 41.3874, longitude: 2.1686 });
	});

	it("keeps a zero coordinate instead of dropping it as falsy", () => {
		const [city] = cityDTO.create([makeCity({ latitude: 0, longitude: 0 })]);

		expect(city.coordinates).toEqual({ latitude: 0, longitude: 0 });
	});
});

describe("cityDTO slug", () => {
	it("derives the slug from the name, since the CMS entry carries no slug field", () => {
		const [city] = cityDTO.create([makeCity({ name: "Buenos Aires" })]);

		expect(city.slug).toBe("buenos-aires");
	});

	it("strips the diacritics and the punctuation a city name may carry", () => {
		const [city] = cityDTO.create([makeCity({ name: "São Paulo, Brazil" })]);

		expect(city.slug).toBe("sao-paulo-brazil");
	});
});

describe("cityDTO period", () => {
	it("renders a closed stay as the two years joined by a hyphen", () => {
		const [city] = cityDTO.create([makeCity({ startDate: "2019-06-01", endDate: "2021-09-30" })]);

		expect(city.period).toBe("2019-2021");
	});

	it("renders an open ended stay as Present when the CMS has no end date", () => {
		const [city] = cityDTO.create([makeCity({ startDate: "2022-01-15" })]);

		expect(city.period).toBe("2022-Present");
	});

	it("treats an empty end date as an open ended stay too, because the field is spread only when truthy", () => {
		const [city] = cityDTO.create([makeCity({ startDate: "2022-01-15", endDate: "" })]);

		expect(city.period).toBe("2022-Present");
	});

	it("uses the calendar year of each date, not the elapsed time between them", () => {
		const [city] = cityDTO.create([makeCity({ startDate: "2019-12-31", endDate: "2020-01-01" })]);

		expect(city.period).toBe("2019-2020");
	});
});

describe("cityDTO passthrough fields", () => {
	it("keeps the name and description verbatim and maps the image to url, dimensions and formats", () => {
		const [city] = cityDTO.create([
			makeCity({
				name: "Barcelona",
				description: "Two summers by the sea",
				image: asset({ url: "//cdn/barcelona.webp", contentType: "image/webp", width: 800, height: 600 }),
			}),
		]);

		expect(city).toMatchObject({
			name: "Barcelona",
			description: "Two summers by the sea",
			image: {
				url: "//cdn/barcelona.webp",
				details: { width: 800, height: 600 },
				formats: { avif: false, webp: true },
			},
		});
	});

	it("maps an empty batch to an empty array synchronously, with no promise in sight", () => {
		const result = cityDTO.create([]);

		expect(result).toEqual([]);
		expect(result).not.toBeInstanceOf(Promise);
	});

	it("preserves the order of the batch it was given", () => {
		const cities = cityDTO.create([makeCity({ name: "Lisbon" }), makeCity({ name: "Berlin" })]);

		expect(cities.map(({ name }) => name)).toEqual(["Lisbon", "Berlin"]);
	});
});
