import { isWithin } from "@modules/core/utils/pathname";
import { describe, expect, it } from "vitest";

describe("isWithin", () => {
	it("matches a route against itself", () => {
		expect(isWithin({ pathname: "/about", route: "/about" })).toBe(true);
	});

	it("matches a page under a section", () => {
		expect(isWithin({ pathname: "/tags/craft", route: "/tags" })).toBe(true);
	});

	it.each(["/tags-manifesto", "/aboutme", "/contactless"])(
		"refuses %s, because a path that merely shares a prefix is not under that route",
		(pathname) => {
			expect(
				isWithin({ pathname: pathname, route: "/tags" }) ||
					isWithin({ pathname: pathname, route: "/about" }) ||
					isWithin({ pathname: pathname, route: "/contact" }),
			).toBe(false);
		},
	);

	it("ignores a trailing slash, which a reader's URL may or may not carry", () => {
		expect(isWithin({ pathname: "/about/", route: "/about" })).toBe(true);
		expect(isWithin({ pathname: "/tags/craft/", route: "/tags" })).toBe(true);
	});

	it("matches the home route only at the root", () => {
		expect(isWithin({ pathname: "/", route: "/" })).toBe(true);
		expect(isWithin({ pathname: "/about", route: "/" })).toBe(false);
	});

	it("matches the home route through a trailing slash too", () => {
		expect(isWithin({ pathname: "/", route: "/" })).toBe(true);
	});

	it("treats a route written with a trailing slash as a section marker, matching only what is under it", () => {
		expect(isWithin({ pathname: "/articles/a-piece", route: "/articles/" })).toBe(true);
		expect(isWithin({ pathname: "/articles", route: "/articles/" })).toBe(false);
		expect(isWithin({ pathname: "/articles/", route: "/articles/" })).toBe(false);
	});

	it("refuses a path under no route at all", () => {
		expect(isWithin({ pathname: "/nowhere", route: "/about" })).toBe(false);
	});
});
