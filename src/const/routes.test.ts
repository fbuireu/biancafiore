import { SITE_URL } from "astro:env/client";
import { describe, expect, it } from "vitest";
import { PAGES_ROUTES } from "./const";
import { absoluteUrl, articleHref, isTagPath, projectHref, tagHref } from "./routes";

describe("articleHref", () => {
	it("addresses an Article by its slug under the articles route", () => {
		expect(articleHref("a-story")).toBe("/articles/a-story");
	});

	it("agrees with the route the listing page links to", () => {
		expect(articleHref("a-story").startsWith(`${PAGES_ROUTES.ARTICLES}/`)).toBe(true);
	});
});

describe("tagHref", () => {
	it("addresses a Tag by its slug under the tags route", () => {
		expect(tagHref("writing")).toBe("/tags/writing");
	});

	it("addresses an Author Tag the same way, because one Slug addresses one page", () => {
		expect(tagHref("bianca-fiore")).toBe("/tags/bianca-fiore");
	});
});

describe("projectHref", () => {
	it("addresses a Project as an anchor on the projects page", () => {
		expect(projectHref("copywriting")).toBe("/projects#copywriting");
	});
});

describe("isTagPath", () => {
	it("recognises a tag page", () => {
		expect(isTagPath(tagHref("writing"))).toBe(true);
	});

	it("rejects the tag listing, with or without a trailing slash", () => {
		expect(isTagPath(PAGES_ROUTES.TAGS)).toBe(false);
		expect(isTagPath(PAGES_ROUTES.TAG)).toBe(false);
	});

	it("rejects a path under another route", () => {
		expect(isTagPath(articleHref("a-story"))).toBe(false);
	});
});

describe("absoluteUrl", () => {
	it("resolves a path against the one configured origin", () => {
		expect(absoluteUrl(articleHref("a-story"))).toBe(`${SITE_URL}/articles/a-story`);
	});

	it("resolves the home route to the bare origin", () => {
		expect(absoluteUrl(PAGES_ROUTES.HOME)).toBe(`${SITE_URL}/`);
	});

	it("keeps a project anchor in the absolute URL", () => {
		expect(absoluteUrl(projectHref("copywriting"))).toBe(`${SITE_URL}/projects#copywriting`);
	});
});
