import { describe, expect, it } from "vitest";
import { articleIsFavorite, articlePublishDateISO, articleReference, articleSlug } from "./reference";

describe("articleSlug", () => {
	it("trims the whitespace the CMS preserves around the slug", () => {
		expect(articleSlug({ slug: "  a-piece  " })).toBe("a-piece");
	});

	it("leaves an already clean slug untouched", () => {
		expect(articleSlug({ slug: "a-piece" })).toBe("a-piece");
	});

	it.each([
		["null", null],
		["empty", ""],
		["nothing but padding", "   "],
	])("refuses an entry whose slug is %s rather than minting one nothing can address", (_name, slug) => {
		expect(() => articleSlug({ slug })).toThrow("no slug");
	});
});

describe("articleSlug, when it refuses an entry", () => {
	it("names the entry by its id, since the slug is the one thing that would have", () => {
		expect(() => articleSlug({ id: "01ARTICLE", slug: "   " })).toThrow("(id 01ARTICLE)");
	});

	it("still refuses an entry that carries no id at all, as a bare fixture does", () => {
		expect(() => articleSlug({ slug: null })).toThrow("no slug");
	});
});

describe("articlePublishDateISO", () => {
	it("answers the ISO instant of a readable publish date", () => {
		expect(articlePublishDateISO({ slug: "a-piece", data: { publish_date: "2024-03-15" } })).toBe(
			"2024-03-15T00:00:00.000Z",
		);
	});

	it("names the entry by its trimmed slug and its id, and says what the date would have placed", () => {
		expect(() =>
			articlePublishDateISO({ id: "01ARTICLE", slug: "  a-piece  ", data: { publish_date: "not-a-date" } }),
		).toThrow(
			'The Article "a-piece" (id 01ARTICLE) has an unreadable publish date (not-a-date), so it cannot take its place in the Blog\'s order',
		);
	});

	it("names an entry with no slug by its id alone, rather than failing to describe the failure", () => {
		expect(() => articlePublishDateISO({ id: "01ARTICLE", slug: null, data: { publish_date: "" } })).toThrow(
			"The Article with no slug (id 01ARTICLE) has an unreadable publish date",
		);
	});

	it("keeps the domain's own refusal as the cause, so the stack still says where the date was judged", () => {
		expect(() => articlePublishDateISO({ slug: "a-piece", data: { publish_date: "not-a-date" } })).toThrow(
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
		[0, false],
		[true, true],
		[1, true],
	] as const)(
		"reads a Favorite flag of %s as %s, so a flag the CMS never sent is not a Favorite",
		(is_favorite, expected) => {
			expect(articleIsFavorite({ data: { is_favorite } })).toBe(expected);
		},
	);
});

describe("articleReference", () => {
	it("names the articles collection, so no caller writes that literal itself", () => {
		expect(articleReference({ slug: "a-piece" })).toEqual({ id: "a-piece", collection: "articles" });
	});

	it("addresses the same entry whether or not the CMS kept padding around the slug", () => {
		expect(articleReference({ slug: "  a-piece  " })).toEqual(articleReference({ slug: "a-piece" }));
	});

	it("refuses to address an entry that has no slug, rather than referencing one that cannot exist", () => {
		expect(() => articleReference({ slug: "" })).toThrow("no slug");
	});
});
