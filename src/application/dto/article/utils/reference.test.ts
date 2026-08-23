import { articleReference, articleSlug } from "@application/dto/article/utils/reference";
import { describe, expect, it } from "vitest";

describe("articleSlug", () => {
	it("trims the whitespace Contentful preserves around the slug", () => {
		expect(articleSlug({ fields: { slug: "  a-piece  " } })).toBe("a-piece");
	});

	it("answers a string for a field Contentful typed loosely, so a caller never stringifies it again", () => {
		expect(articleSlug({ fields: { slug: 2024 } })).toBe("2024");
	});

	it("leaves an already clean slug untouched", () => {
		expect(articleSlug({ fields: { slug: "a-piece" } })).toBe("a-piece");
	});

	it.each([
		["absent", undefined],
		["null", null],
		["empty", ""],
		["nothing but the padding Contentful kept", "   "],
	])("refuses an entry whose slug is %s rather than minting one nothing can address", (_name, slug) => {
		expect(() => articleSlug({ fields: { slug } })).toThrow("no slug");
	});

	it("does not mint the string undefined, which a caller would drop without a word", () => {
		expect(() => articleSlug({ fields: {} })).toThrow();
	});
});

describe("articleReference", () => {
	it("names the articles collection, so no caller writes that literal itself", () => {
		expect(articleReference({ fields: { slug: "a-piece" } })).toEqual({ id: "a-piece", collection: "articles" });
	});

	it("addresses the same entry whether or not the CMS kept padding around the slug", () => {
		expect(articleReference({ fields: { slug: "  a-piece  " } })).toEqual(
			articleReference({ fields: { slug: "a-piece" } }),
		);
	});

	it("carries the trimmed slug as its id, so a reference cannot drift from the collection key", () => {
		expect(articleReference({ fields: { slug: " a-piece " } }).id).toBe("a-piece");
	});

	it("refuses to address an entry that has no slug, rather than referencing one that cannot exist", () => {
		expect(() => articleReference({ fields: { slug: "" } })).toThrow("no slug");
	});
});
