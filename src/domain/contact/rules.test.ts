import { describe, expect, it } from "vitest";
import { normalizeEmail } from "./rules";
import { contactEmailSchema } from "./schema";

describe("normalizeEmail", () => {
	it("lowercases the whole address", () => {
		expect(normalizeEmail(contactEmailSchema.parse("Ada@Example.COM"))).toBe("ada@example.com");
	});

	it("drops the whitespace a browser autofill leaves around the address", () => {
		expect(normalizeEmail(contactEmailSchema.parse("  ada@example.com\n"))).toBe("ada@example.com");
	});

	it("strips the plus alias so an alias and its owner are the same person", () => {
		expect(normalizeEmail(contactEmailSchema.parse("ada+newsletter@example.com"))).toBe("ada@example.com");
	});

	it("strips everything from the first plus to the at sign, however many pluses there are", () => {
		expect(normalizeEmail(contactEmailSchema.parse("ada+news+2026@example.com"))).toBe("ada@example.com");
	});

	it("drops an empty alias, a bare trailing plus", () => {
		expect(normalizeEmail(contactEmailSchema.parse("ada+@example.com"))).toBe("ada@example.com");
	});

	it("leaves an address without an alias untouched beyond casing and trimming", () => {
		expect(normalizeEmail(contactEmailSchema.parse("ada@example.com"))).toBe("ada@example.com");
	});

	it("applies trimming, lowercasing and alias stripping together", () => {
		expect(normalizeEmail(contactEmailSchema.parse("  Ada+News@Example.com  "))).toBe("ada@example.com");
	});
});
