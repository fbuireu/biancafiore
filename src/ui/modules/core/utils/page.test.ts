import { getPage } from "@modules/core/utils/page";
import { describe, expect, it } from "vitest";

const at = (pathname: string) => new URL(pathname, "https://biancafiore.test");

describe("getPage", () => {
	it.each([
		["/", "home"],
		["/about", "about"],
		["/contact", "contact"],
		["/projects", "projects"],
		["/articles", "articles"],
		["/tags", "tags"],
		["/terms-and-conditions", "terms-and-conditions"],
		["/privacy-policy", "privacy-policy"],
	])("names %s as the %s page", (pathname, page) => {
		expect(getPage(at(pathname))).toBe(page);
	});

	it("names an article's own page article, not articles, so the reading layout applies", () => {
		expect(getPage(at("/articles/a-piece"))).toBe("article");
	});

	it("gives a tag detail page the tags container, because there is deliberately no page--tag", () => {
		expect(getPage(at("/tags/craft"))).toBe("tags");
	});

	it.each(["/tags-manifesto", "/about-me", "/projects-archive"])(
		"leaves %s unnamed, because a route that merely shares a prefix is not that route",
		(pathname) => {
			expect(getPage(at(pathname))).toBeUndefined();
		},
	);

	it("leaves a path under no known route unnamed", () => {
		expect(getPage(at("/nowhere"))).toBeUndefined();
	});
});
