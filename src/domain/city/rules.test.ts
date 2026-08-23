import { createPeriod, formatPeriod } from "@domain/city/rules";
import { describe, expect, it } from "vitest";

describe("createPeriod", () => {
	it("keeps the years the Author lived in a City, not the dates the CMS holds", () => {
		expect(createPeriod({ startDate: "2019-06-01", endDate: "2021-09-30" })).toEqual({
			startYear: 2019,
			endYear: 2021,
		});
	});

	it("leaves the end open when the Author has not left, which is what Present means", () => {
		expect(createPeriod({ startDate: "2022-01-15" })).toEqual({ startYear: 2022 });
	});

	it("treats an empty end date as no end date at all", () => {
		expect(createPeriod({ startDate: "2022-01-15", endDate: "" })).toEqual({ startYear: 2022 });
	});

	it("reads the year in UTC, so a January start is the same year west of it", () => {
		expect(createPeriod({ startDate: "2020-01-01T00:00:00Z" }).startYear).toBe(2020);
	});

	it("keeps a period that opens and closes across a new year as two years", () => {
		expect(createPeriod({ startDate: "2019-12-31", endDate: "2020-01-01" })).toEqual({
			startYear: 2019,
			endYear: 2020,
		});
	});

	it("refuses a start the CMS left unreadable rather than minting a NaN that reaches the page", () => {
		expect(() => createPeriod({ startDate: "not-a-date" })).toThrow(/unreadable date/);
	});

	it("refuses an unreadable end for the same reason", () => {
		expect(() => createPeriod({ startDate: "2019-01-01", endDate: "not-a-date" })).toThrow(/unreadable date/);
	});
});

describe("formatPeriod", () => {
	it("prints a closed period as its two years", () => {
		expect(formatPeriod({ startYear: 2015, endYear: 2018 })).toBe("2015-2018");
	});

	it("prints an open period as running to Present, the word CONTEXT.md gives it", () => {
		expect(formatPeriod({ startYear: 2021 })).toBe("2021-Present");
	});

	it("prints a single year as that year on both sides, since the Author has not left", () => {
		expect(formatPeriod({ startYear: 2024, endYear: 2024 })).toBe("2024-2024");
	});
});
