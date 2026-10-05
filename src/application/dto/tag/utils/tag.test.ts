import { describe, expect, it } from "vitest";
import { tagIdentity } from "./tag";

describe("tagIdentity", () => {
	it("answers the trimmed name and slug, the two strings the Tag Index and Related Articles must agree on", () => {
		expect(tagIdentity({ fields: { name: "  Craft\n", slug: " craft " } })).toEqual({ name: "Craft", slug: "craft" });
	});

	it("leaves a clean Tag untouched", () => {
		expect(tagIdentity({ fields: { name: "Craft", slug: "craft" } })).toEqual({ name: "Craft", slug: "craft" });
	});

	it.each([
		["empty", ""],
		["only the padding Contentful kept", "  \n "],
	])(
		"refuses a Tag whose name is %s, naming it, since the Tag Index files a Tag under the first letter of its name",
		(_name, name) => {
			expect(() => tagIdentity({ sys: { id: "7zXbYcVdE" }, fields: { name, slug: "craft" } })).toThrow(
				'The Tag "craft" (sys.id 7zXbYcVdE) has an empty name, so the Tag Index cannot file it under a letter',
			);
		},
	);

	it("refuses a Tag whose slug is empty, since no page could address it", () => {
		expect(() => tagIdentity({ sys: { id: "7zXbYcVdE" }, fields: { name: "Craft", slug: "   " } })).toThrow(
			'The Tag "Craft" (sys.id 7zXbYcVdE) has no slug, so no page can address it',
		);
	});

	it("still names a Tag whose entry carries no sys, as a bare fixture does", () => {
		expect(() => tagIdentity({ fields: { name: "", slug: "craft" } })).toThrow(
			'The Tag "craft" has an empty name, so the Tag Index cannot file it under a letter',
		);
	});
});
