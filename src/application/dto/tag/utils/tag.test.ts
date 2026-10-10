import { describe, expect, it } from "vitest";
import { tagIdentity } from "./tag";

describe("tagIdentity", () => {
	it("answers the trimmed name and slug, the two strings the Tag Index and Related Articles must agree on", () => {
		expect(tagIdentity({ label: "  Craft\n", slug: " craft " })).toEqual({ name: "Craft", slug: "craft" });
	});

	it("leaves a clean Tag untouched", () => {
		expect(tagIdentity({ label: "Craft", slug: "craft" })).toEqual({ name: "Craft", slug: "craft" });
	});

	it.each([
		["empty", ""],
		["only the padding the CMS kept", "  \n "],
	])(
		"refuses a Tag whose name is %s, naming it, since the Tag Index files a Tag under the first letter of its name",
		(_name, label) => {
			expect(() => tagIdentity({ id: "01TERM", label, slug: "craft" })).toThrow(
				'The Tag "craft" (id 01TERM) has an empty name, so the Tag Index cannot file it under a letter',
			);
		},
	);

	it("refuses a Tag whose slug is empty, since no page could address it", () => {
		expect(() => tagIdentity({ id: "01TERM", label: "Craft", slug: "   " })).toThrow(
			'The Tag "Craft" (id 01TERM) has no slug, so no page can address it',
		);
	});

	it("still names a Tag that carries no id, as a bare fixture does", () => {
		expect(() => tagIdentity({ label: "", slug: "craft" })).toThrow(
			'The Tag "craft" has an empty name, so the Tag Index cannot file it under a letter',
		);
	});
});
