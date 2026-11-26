import { describe, expect, it } from "vitest";
import { contactEmailSchema, contactNormalizedEmailSchema } from "./schema";

describe("contactEmailSchema", () => {
	it("trims the address a browser autofill padded", () => {
		expect(contactEmailSchema.parse("  ada@example.com\n")).toBe("ada@example.com");
	});

	it("keeps the alias and the casing, because the mail must reach the address as typed", () => {
		expect(contactEmailSchema.parse("Ada+news@Example.com")).toBe("Ada+news@Example.com");
	});

	it("refuses a string that is not an address, with the form's own message", () => {
		expect(contactEmailSchema.safeParse("ada@").error?.issues.map(({ message }) => message)).toEqual([
			"Still not a valid email fella",
		]);
	});
});

describe("contactNormalizedEmailSchema", () => {
	it("does not touch a plus that sits in the domain, where it is not an alias", () => {
		expect(contactNormalizedEmailSchema.parse("ada@ex+ample.com")).toBe("ada@ex+ample.com");
	});
});
