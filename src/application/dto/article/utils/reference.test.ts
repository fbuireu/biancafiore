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

	it("carries the id articleSlug derives, so a reference cannot drift from the collection key", () => {
		const raw = { fields: { slug: " a-piece " } };

		expect(articleReference(raw).id).toBe(articleSlug(raw));
	});
});
