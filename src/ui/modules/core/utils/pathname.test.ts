import { isWithin } from "@modules/core/utils/pathname";
import { describe, expect, it } from "vitest";

describe("isWithin", () => {
	it("matches a route against itself", () => {
		expect(isWithin("/about", "/about")).toBe(true);
	});

	it("matches a page under a section", () => {
		expect(isWithin("/tags/craft", "/tags")).toBe(true);
	});

	it.each(["/tags-manifesto", "/aboutme", "/contactless"])(
		"refuses %s, because a path that merely shares a prefix is not under that route",
		(pathname) => {
			expect(isWithin(pathname, "/tags") || isWithin(pathname, "/about") || isWithin(pathname, "/contact")).toBe(false);
		},
	);

	it("ignores a trailing slash, which a reader's URL may or may not carry", () => {
		expect(isWithin("/about/", "/about")).toBe(true);
		expect(isWithin("/tags/craft/", "/tags")).toBe(true);
	});

	it("matches the home route only at the root", () => {
		expect(isWithin("/", "/")).toBe(true);
		expect(isWithin("/about", "/")).toBe(false);
	});

	it("matches the home route through a trailing slash too", () => {
		expect(isWithin("/", "/")).toBe(true);
	});

	it("treats a route written with a trailing slash as a section marker, matching only what is under it", () => {
		expect(isWithin("/articles/a-piece", "/articles/")).toBe(true);
		expect(isWithin("/articles", "/articles/")).toBe(false);
		expect(isWithin("/articles/", "/articles/")).toBe(false);
	});

	it("refuses a path under no route at all", () => {
		expect(isWithin("/nowhere", "/about")).toBe(false);
	});
});
