import { describe, expect, it } from "vitest";
import { flagOf } from "./flags";

describe("flagOf", () => {
	it("reads the integer SQLite stores a ticked box as, and the boolean an editor's save may send", () => {
		expect(flagOf(1)).toBe(true);
		expect(flagOf(true)).toBe(true);
	});

	it("reads an unticked box, and one the CMS never received, as false", () => {
		expect(flagOf(0)).toBe(false);
		expect(flagOf(false)).toBe(false);
		expect(flagOf(undefined)).toBe(false);
	});
});
