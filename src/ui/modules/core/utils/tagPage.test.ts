import { TagType } from "@domain/tag/types";
import { tagPageCopy } from "@modules/core/utils/tagPage";
import { describe, expect, it } from "vitest";

describe("tagPageCopy for a topical Tag", () => {
	it("heads the page with the hash form of the slug, as the tag pages always have", () => {
		expect(tagPageCopy({ name: "Content marketing", slug: "content-marketing", type: TagType.TAG })).toEqual({
			heading: "#content-marketing",
			title: "#content-marketing",
			description: "Articles tagged with #content-marketing.",
		});
	});
});

describe("tagPageCopy for an Author Tag", () => {
	it("names the person rather than hashing their slug, since an Author Tag is not a topic", () => {
		expect(tagPageCopy({ name: "Bianca Fiore", slug: "bianca-fiore", type: TagType.AUTHOR })).toEqual({
			heading: "Bianca Fiore",
			title: "Bianca Fiore",
			description: "Articles written by Bianca Fiore.",
		});
	});

	it("reads the type rather than the slug, so an author whose slug looks like a topic still reads as a byline", () => {
		expect(tagPageCopy({ name: "Craft", slug: "craft", type: TagType.AUTHOR }).description).toBe(
			"Articles written by Craft.",
		);
	});
});
