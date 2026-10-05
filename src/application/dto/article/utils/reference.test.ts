import { describe, expect, it } from "vitest";
import { articleIsFavorite, articlePublishDateISO, articleReference, articleSlug } from "./reference";

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
});

describe("articleSlug, when it refuses an entry", () => {
	it("names the entry by its sys.id, since the slug is the one thing that would have", () => {
		expect(() => articleSlug({ sys: { id: "5abCdEfGh" }, fields: { slug: "   " } })).toThrow("(5abCdEfGh)");
	});

	it("still refuses an entry that carries no sys at all, as a bare fixture does", () => {
		expect(() => articleSlug({ fields: {} })).toThrow("no slug");
	});
});

describe("articlePublishDateISO", () => {
	it("answers the ISO instant of a readable publish date", () => {
		expect(articlePublishDateISO({ fields: { slug: "a-piece", publishDate: "2024-03-15" } })).toBe(
			"2024-03-15T00:00:00.000Z",
		);
	});

	it("names the entry by its trimmed slug and its sys.id, and says what the date would have placed", () => {
		expect(() =>
			articlePublishDateISO({ sys: { id: "5abCdEfGh" }, fields: { slug: "  a-piece  ", publishDate: "not-a-date" } }),
		).toThrow(
			'The Article "a-piece" (sys.id 5abCdEfGh) has an unreadable publish date (not-a-date), so it cannot take its place in the Blog\'s order',
		);
	});

	it("names an entry with no slug by its sys.id alone, rather than failing to describe the failure", () => {
		expect(() => articlePublishDateISO({ sys: { id: "5abCdEfGh" }, fields: { publishDate: "" } })).toThrow(
			"The Article with no slug (sys.id 5abCdEfGh) has an unreadable publish date",
		);
	});

	it("keeps the domain's own refusal as the cause, so the stack still says where the date was judged", () => {
		expect(() => articlePublishDateISO({ fields: { slug: "a-piece", publishDate: "not-a-date" } })).toThrow(
			expect.objectContaining({
				cause: expect.objectContaining({
					message: "An Article reached the mapper with an unreadable publish date: not-a-date",
				}),
			}),
		);
	});
});

describe("articleIsFavorite", () => {
	it.each([
		[undefined, false],
		[false, false],
		[true, true],
	])("reads a Favorite flag of %s as %s, so a flag the CMS never sent is not a Favorite", (isFavorite, expected) => {
		expect(articleIsFavorite({ fields: { isFavorite } })).toBe(expected);
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

	it("refuses to address an entry that has no slug, rather than referencing one that cannot exist", () => {
		expect(() => articleReference({ fields: { slug: "" } })).toThrow("no slug");
	});
});
