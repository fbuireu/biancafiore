import { DEFAULT_DATE_FORMAT, DEFAULT_LOCALE_STRING } from "@const/index";
import { formatDate } from "@shared/utils/dates";
import { describe, expect, it } from "vitest";

const LONG_UK_DATE = /^[A-Z][a-z]+, \d{1,2} [A-Z][a-z]+ \d{4}$/;

describe("formatDate", () => {
	it("is configured for en-GB with long weekday and month names", () => {
		expect(DEFAULT_LOCALE_STRING).toBe("en-GB");
		expect(DEFAULT_DATE_FORMAT).toEqual({ weekday: "long", year: "numeric", month: "long", day: "numeric" });
	});

	it("renders a Date as weekday, day, long month and full year", () => {
		expect(formatDate(new Date(2026, 6, 30, 12))).toBe("Thursday, 30 July 2026");
	});

	it("renders a local-time string exactly like the equivalent Date instance", () => {
		const date = new Date(2026, 6, 30, 12);

		expect(formatDate("2026-07-30T12:00:00")).toBe(formatDate(date));
	});

	it("does not zero-pad single-digit days", () => {
		expect(formatDate(new Date(2000, 0, 1, 12))).toBe("Saturday, 1 January 2000");
	});

	it("renders a leap day rather than rolling it into March", () => {
		expect(formatDate(new Date(2024, 1, 29, 12))).toBe("Thursday, 29 February 2024");
	});

	it("keeps the calendar day of a moment just before midnight", () => {
		expect(formatDate(new Date(1999, 11, 31, 23, 59, 59))).toBe("Friday, 31 December 1999");
	});

	it("interprets a date-only ISO string as UTC midnight, not local midnight", () => {
		expect(formatDate("2026-07-30")).toBe(formatDate(new Date(Date.UTC(2026, 6, 30))));
	});

	it("produces the same shape for any valid date", () => {
		expect(formatDate(new Date(2026, 6, 30, 12))).toMatch(LONG_UK_DATE);
		expect(formatDate(new Date(1970, 0, 1, 12))).toMatch(LONG_UK_DATE);
		expect(formatDate("2026-05-18T12:00:00")).toMatch(LONG_UK_DATE);
	});

	it("returns the literal Invalid Date for unparseable input instead of throwing", () => {
		expect(formatDate("not a date")).toBe("Invalid Date");
		expect(formatDate("")).toBe("Invalid Date");
		expect(formatDate(new Date(Number.NaN))).toBe("Invalid Date");
	});
});
