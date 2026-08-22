import { normalizeEmail } from "@domain/contact/rules";
import { describe, expect, it } from "vitest";

describe("normalizeEmail", () => {
	it("lowercases the whole address", () => {
		expect(normalizeEmail("Ada@Example.COM")).toBe("ada@example.com");
	});

	it("drops the whitespace a browser autofill leaves around the address", () => {
		expect(normalizeEmail("  ada@example.com\n")).toBe("ada@example.com");
	});

	it("strips the plus alias so an alias and its owner are the same person", () => {
		expect(normalizeEmail("ada+newsletter@example.com")).toBe("ada@example.com");
	});

	it("strips everything from the first plus to the at sign, however many pluses there are", () => {
		expect(normalizeEmail("ada+news+2026@example.com")).toBe("ada@example.com");
	});

	it("drops an empty alias, a bare trailing plus", () => {
		expect(normalizeEmail("ada+@example.com")).toBe("ada@example.com");
	});

	it("leaves an address without an alias untouched beyond casing and trimming", () => {
		expect(normalizeEmail("ada@example.com")).toBe("ada@example.com");
	});

	it("does not touch a plus that sits in the domain, where it is not an alias", () => {
		expect(normalizeEmail("ada@ex+ample.com")).toBe("ada@ex+ample.com");
	});

	it("applies trimming, lowercasing and alias stripping together", () => {
		expect(normalizeEmail("  Ada+News@Example.com  ")).toBe("ada@example.com");
	});
});
