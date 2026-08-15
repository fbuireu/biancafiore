import { SITE_URL } from "astro:env/client";
import { describe, expect, it } from "vitest";
import { buildArticleShareLinks } from "./share";

describe("buildArticleShareLinks", () => {
	it("shares the Article's absolute URL, not the one the visitor happens to be on", () => {
		const { linkedin, x } = buildArticleShareLinks({ slug: "a-story", title: "A story" });
		const shared = `${SITE_URL}/articles/a-story`;

		expect(new URL(linkedin).searchParams.get("url")).toBe(shared);
		expect(new URL(x).searchParams.get("url")).toBe(shared);
	});

	it("names the Tags rather than stringifying them", () => {
		const { x } = buildArticleShareLinks({
			slug: "a-story",
			title: "A story",
			tags: [{ name: "Content Writing" }, { name: "SEO" }],
		});

		expect(new URL(x).searchParams.get("hashtags")).toBe("ContentWriting,SEO");
	});

	it("omits the hashtags parameter when the Article carries no Tags", () => {
		const { x } = buildArticleShareLinks({ slug: "a-story", title: "A story", tags: [] });

		expect(new URL(x).searchParams.has("hashtags")).toBe(false);
	});

	it("encodes a title that would otherwise break the query string", () => {
		const title = "Writing & editing: a guide";
		const { x } = buildArticleShareLinks({ slug: "a-story", title });

		expect(new URL(x).searchParams.get("text")).toBe(title);
	});
});
