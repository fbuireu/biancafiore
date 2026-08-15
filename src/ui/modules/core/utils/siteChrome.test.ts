import { describe, expect, it } from "vitest";
import { siteChrome } from "./siteChrome";

const at = (pathname: string) => new URL(pathname, "https://biancafiore.test");

describe("siteChrome", () => {
	it("shows every piece of chrome and the real page when the site is open", () => {
		expect(siteChrome(at("/about"), false)).toEqual({
			showsHeader: true,
			showsBreadcrumbs: true,
			showsTableOfContents: true,
			servesRealContent: true,
		});
	});

	it("hides the header, the breadcrumbs and the table of contents together", () => {
		const { showsHeader, showsBreadcrumbs, showsTableOfContents } = siteChrome(at("/articles/a-story"), true);

		expect([showsHeader, showsBreadcrumbs, showsTableOfContents]).toEqual([false, false, false]);
	});

	it.each(["/articles", "/articles/a-story", "/tags", "/tags/seo", "/terms-and-conditions", "/privacy-policy"])(
		"still serves the writing at %s while the site is hidden",
		(pathname) => {
			expect(siteChrome(at(pathname), true).servesRealContent).toBe(true);
		},
	);

	it.each(["/404", "/500"])("still serves the error page at %s while the site is hidden", (pathname) => {
		expect(siteChrome(at(pathname), true).servesRealContent).toBe(true);
	});

	it.each(["/", "/about", "/contact", "/projects"])("replaces %s with the placeholder while hidden", (pathname) => {
		expect(siteChrome(at(pathname), true).servesRealContent).toBe(false);
	});

	it("matches whole path segments, so a route that merely shares a prefix stays hidden", () => {
		expect(siteChrome(at("/tags-manifesto"), true).servesRealContent).toBe(false);
		expect(siteChrome(at("/articles-about-me"), true).servesRealContent).toBe(false);
	});

	it("falls back to the environment flag when the caller does not pass one", () => {
		expect(siteChrome(at("/about"))).toEqual(siteChrome(at("/about"), false));
	});
});
