import type { CityEntry } from "@modules/core/utils/entries";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WORLD_GLOBE_MARKER_CLASS, WORLD_GLOBE_MARKER_LABEL_CLASS } from "../components/worldGlobe/const";
import { type CityPoint, calculateCenter, renderPin, toCityPoints } from "./globe";

const point = (overrides: Partial<CityPoint> = {}): CityPoint => ({
	lat: 0,
	lng: 0,
	label: "Barcelona",
	slug: "barcelona",
	...overrides,
});

const city = (data: Partial<CityEntry["data"]> = {}): CityEntry =>
	({
		id: "barcelona",
		data: {
			name: "Barcelona",
			slug: "barcelona",
			coordinates: { latitude: 41.39, longitude: 2.16 },
			period: { startYear: 2015 },
			description: "Where the writing started.",
			image: {
				url: "/_emdash/api/media/file/city.jpg",
				details: { width: 800, height: 600 },
			},
			...data,
		},
	}) as CityEntry;

describe("toCityPoints", () => {
	it("projects a City onto the coordinates, name and Slug the globe reads, and ships nothing else", () => {
		expect(toCityPoints([city()])).toEqual([{ lat: 41.39, lng: 2.16, label: "Barcelona", slug: "barcelona" }]);
	});

	it("keeps the order the collection stored, so pins and cards agree", () => {
		const points = toCityPoints([
			city({ name: "Barcelona", slug: "barcelona" }),
			city({ name: "Lisbon", slug: "lisbon", coordinates: { latitude: 38.72, longitude: -9.14 } }),
		]);

		expect(points.map(({ slug }) => slug)).toEqual(["barcelona", "lisbon"]);
		expect(points.at(1)).toEqual({ lat: 38.72, lng: -9.14, label: "Lisbon", slug: "lisbon" });
	});

	it("answers no points for no cities", () => {
		expect(toCityPoints([])).toEqual([]);
	});
});

describe("calculateCenter", () => {
	it("averages the coordinates of every point", () => {
		const center = calculateCenter([
			point({ lat: 10, lng: 20 }),
			point({ lat: 20, lng: 40 }),
			point({ lat: 30, lng: 60 }),
		]);

		expect(center).toEqual({ latitude: 20, longitude: 40 });
	});

	it("keeps negative coordinates signed", () => {
		expect(calculateCenter([point({ lat: -30, lng: -60 }), point({ lat: 10, lng: 20 })])).toEqual({
			latitude: -10,
			longitude: -20,
		});
	});

	it("answers the origin rather than NaN when there is no point to average", () => {
		expect(calculateCenter([])).toEqual({ latitude: 0, longitude: 0 });
	});
});

describe("renderPin", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		document.body.innerHTML = "";
	});

	it("names the marker after the city's slug rather than re-deriving it from the label", () => {
		const pin = renderPin(point({ label: "New York City", slug: "new-york-city" }));

		expect([...pin.classList]).toEqual([WORLD_GLOBE_MARKER_CLASS, `${WORLD_GLOBE_MARKER_CLASS}--new-york-city`]);
		expect(pin.querySelector(`.${WORLD_GLOBE_MARKER_LABEL_CLASS}`)?.textContent).toBe("New York City");
		expect(pin.querySelector("title")?.textContent).toBe("New York City");
	});

	it("scrolls to the card whose id is the point's slug", () => {
		const scrollTo = vi.fn();
		vi.stubGlobal("scrollTo", scrollTo);

		const card = document.createElement("li");
		card.id = "sydney";
		document.body.append(card);

		renderPin(point({ label: "Sydney", slug: "sydney" })).click();

		expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
	});

	it("does nothing when no card carries that slug", () => {
		const scrollTo = vi.fn();
		vi.stubGlobal("scrollTo", scrollTo);

		renderPin(point({ slug: "nowhere" })).click();

		expect(scrollTo).not.toHaveBeenCalled();
	});
});
