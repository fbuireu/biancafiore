import { DEFAULT_DATE_FORMAT, DEFAULT_LOCALE_STRING } from "@const/index";
import { formatDate } from "@shared/utils/dates";
import { describe, expect, it } from "vitest";

describe("formatDate", () => {
	it("is configured for en-GB with long weekday and month names", () => {
		expect(DEFAULT_LOCALE_STRING).toBe("en-GB");
		expect(DEFAULT_DATE_FORMAT).toEqual({ weekday: "long", year: "numeric", month: "long", day: "numeric" });
	});

	it("renders a Date as weekday, day, long month and full year", () => {
		expect(formatDate(new Date(2026, 6, 30, 12))).toBe("Thursday, 30 July 2026");
	});

	it("accepts a date-time string as readily as a Date, naming the same day", () => {
		expect(formatDate("2026-07-30T12:00:00")).toBe("Thursday, 30 July 2026");
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

	it("names the UTC calendar day, so the same content reads the same in every timezone", () => {
		expect(formatDate("2026-07-30T23:30:00Z")).toBe("Thursday, 30 July 2026");
		expect(formatDate("2026-07-30T00:30:00Z")).toBe("Thursday, 30 July 2026");
	});

	it("interprets a date-only ISO string as UTC midnight, so it never slips to the day before", () => {
		expect(formatDate("2026-07-30")).toBe("Thursday, 30 July 2026");
		expect(formatDate("2024-01-01")).toBe("Monday, 1 January 2024");
	});

	it("names the weekday and month of any date, not only of the ones the other cases pin", () => {
		expect(formatDate(new Date(1970, 0, 1, 12))).toBe("Thursday, 1 January 1970");
		expect(formatDate("2026-05-18T12:00:00")).toBe("Monday, 18 May 2026");
	});

	it("returns the literal Invalid Date for unparseable input instead of throwing", () => {
		expect(formatDate("not a date")).toBe("Invalid Date");
		expect(formatDate("")).toBe("Invalid Date");
		expect(formatDate(new Date(Number.NaN))).toBe("Invalid Date");
	});
});
