import { describe, expect, it } from "vitest";
import { isNoindexRoute, NOINDEX_ROUTES } from "./noindexRoutes";

describe("isNoindexRoute", () => {
	it.each(NOINDEX_ROUTES)("answers yes for %s, with or without its trailing slash", (route) => {
		expect(isNoindexRoute(route)).toBe(true);
		expect(isNoindexRoute(`${route}/`)).toBe(true);
	});

	it.each(["/", "/about", "/articles/privacy-policy", "/privacy-policy-notes", "/terms-and-conditions/archive"])(
		"answers no for %s, since a route is whole path segments and not a prefix",
		(pathname) => {
			expect(isNoindexRoute(pathname)).toBe(false);
		},
	);

	it("lists the unindexed routes once, in the order the legal pages are linked", () => {
		expect(NOINDEX_ROUTES).toEqual(["/terms-and-conditions", "/privacy-policy"]);
	});
});
