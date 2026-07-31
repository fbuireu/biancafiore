import { createDate, formatPeriod } from "@domain/city/rules";
import { describe, expect, it } from "vitest";

describe("createDate", () => {
	it("reduces both ends of a stay to their year", () => {
		expect(createDate({ startDate: "2015-06-15T12:00:00", endDate: "2018-09-01T12:00:00" })).toEqual({
			startDate: 2015,
			endDate: 2018,
		});
	});

	it("marks a stay with no end date as still ongoing", () => {
		expect(createDate({ startDate: "2021-06-15T12:00:00" })).toEqual({ startDate: 2021, endDate: "Present" });
	});

	it("treats an empty end date the same as a missing one", () => {
		expect(createDate({ startDate: "2021-06-15T12:00:00", endDate: "" }).endDate).toBe("Present");
	});

	it("always reports an end, so the field is never left undefined", () => {
		const period = createDate({ startDate: "2021-06-15T12:00:00" });

		expect("endDate" in period).toBe(true);
		expect(period.endDate).not.toBeUndefined();
	});

	it("collapses a stay that begins and ends in the same year to one repeated year", () => {
		expect(createDate({ startDate: "2020-01-10T12:00:00", endDate: "2020-12-20T12:00:00" })).toEqual({
			startDate: 2020,
			endDate: 2020,
		});
	});

	it("runs somewhere with a non-zero offset, without which the UTC case below proves nothing", () => {
		expect([
			new Date(Date.UTC(2021, 0, 1)).getTimezoneOffset(),
			new Date(Date.UTC(2021, 6, 1)).getTimezoneOffset(),
		]).not.toContain(0);
	});

	it("reads the year in UTC, so a stay does not shift a year with the runtime timezone", () => {
		expect(createDate({ startDate: "2021-01-01T00:30:00Z", endDate: "2021-12-31T23:30:00Z" })).toEqual({
			startDate: 2021,
			endDate: 2021,
		});
	});

	it("accepts a full ISO timestamp as readily as a plain date", () => {
		expect(createDate({ startDate: "2017-03-04T08:30:00.000Z" }).startDate).toBe(2017);
	});

	it("yields NaN instead of raising when the date cannot be parsed", () => {
		expect(Number.isNaN(createDate({ startDate: "not-a-date" }).startDate)).toBe(true);
		expect(Number.isNaN(createDate({ startDate: "2020-06-15T12:00:00", endDate: "whenever" }).endDate as number)).toBe(
			true,
		);
	});
});

describe("formatPeriod", () => {
	it("joins the two years with a hyphen", () => {
		expect(formatPeriod({ startDate: "2015-06-15T12:00:00", endDate: "2018-09-01T12:00:00" })).toBe("2015-2018");
	});

	it('reads as "Present" while the stay is still open', () => {
		expect(formatPeriod({ startDate: "2021-06-15T12:00:00" })).toBe("2021-Present");
	});

	it("repeats the year for a stay contained in a single year", () => {
		expect(formatPeriod({ startDate: "2020-01-10T12:00:00", endDate: "2020-12-20T12:00:00" })).toBe("2020-2020");
	});

	it("surfaces an unparseable date as NaN in the rendered period", () => {
		expect(formatPeriod({ startDate: "not-a-date" })).toBe("NaN-Present");
	});
});
