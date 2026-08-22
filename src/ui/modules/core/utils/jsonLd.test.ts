import {
	buildArticleListSchema,
	buildBlogPostingSchema,
	buildBreadcrumbListSchema,
	buildContactPageSchema,
	buildProfilePageSchema,
	buildProjectListSchema,
	buildTagListSchema,
	buildWebSiteSchema,
} from "@modules/core/utils/jsonLd";
import { describe, expect, it } from "vitest";

const ORIGIN = "https://biancafiore.test";

const parse = (schema: string): Record<string, unknown> => JSON.parse(schema);

const AUTHOR = { name: "Bianca Fiore", jobTitle: "Content writer", url: `${ORIGIN}/about` };

const BLOG_POSTING = {
	url: `${ORIGIN}/articles/a-piece`,
	headline: "A piece",
	description: "About something",
	datePublished: "2026-03-15T00:00:00.000Z",
	author: AUTHOR,
	publisher: { name: "Bianca Fiore", url: ORIGIN },
};

describe("serialisation", () => {
	it("escapes the opening angle bracket, so a schema can never close the script tag that carries it", () => {
		const schema = buildContactPageSchema({
			url: `${ORIGIN}/contact`,
			name: "</script><script>alert(1)</script>",
			description: "Say hello",
		});

		expect(schema).not.toContain("</script>");
		expect(schema).toContain(String.raw`\u003c`);
		expect(parse(schema).name).toBe("</script><script>alert(1)</script>");
	});
});

describe("list schemas", () => {
	it("resolves an article slug against the site origin, so no caller spells the path itself", () => {
		const list = parse(buildArticleListSchema(["a-piece"]));

		expect(list.itemListElement).toEqual([{ "@type": "ListItem", position: 1, url: `${ORIGIN}/articles/a-piece` }]);
	});

	it("resolves a tag slug the same way", () => {
		const list = parse(buildTagListSchema(["craft"]));

		expect(list.itemListElement).toEqual([{ "@type": "ListItem", position: 1, url: `${ORIGIN}/tags/craft` }]);
	});

	it("addresses a project as a fragment on the projects page, which is the only address one has", () => {
		const list = parse(buildProjectListSchema(["weekly-dispatch"]));

		expect(list.itemListElement).toEqual([
			{ "@type": "ListItem", position: 1, url: `${ORIGIN}/projects#weekly-dispatch` },
		]);
	});

	it("numbers positions from one, in the order it was given", () => {
		const list = parse(buildArticleListSchema(["first", "second", "third"]));

		expect(list.itemListElement).toMatchObject([{ position: 1 }, { position: 2 }, { position: 3 }]);
	});

	it("answers an empty list rather than nothing when there is no content", () => {
		expect(parse(buildArticleListSchema([]))).toMatchObject({ "@type": "ItemList", itemListElement: [] });
	});
});

describe("buildBlogPostingSchema", () => {
	it("omits the image entirely for an article that has none, rather than emitting an empty one", () => {
		expect(parse(buildBlogPostingSchema(BLOG_POSTING))).not.toHaveProperty("image");
	});

	it("emits one crop per declared aspect ratio for an article that has one", () => {
		const schema = parse(buildBlogPostingSchema({ ...BLOG_POSTING, imageUrl: `${ORIGIN}/hero.jpg` }));

		expect(schema.image).toEqual([
			`${ORIGIN}/hero.jpg?w=1200&h=675&fit=fill`,
			`${ORIGIN}/hero.jpg?w=1200&h=900&fit=fill`,
			`${ORIGIN}/hero.jpg?w=1200&h=1200&fit=fill`,
		]);
	});

	it("omits keywords when the article carries no tags", () => {
		expect(parse(buildBlogPostingSchema({ ...BLOG_POSTING, keywords: [] }))).not.toHaveProperty("keywords");
	});

	it("joins the tags it does have into one keywords string", () => {
		const schema = parse(buildBlogPostingSchema({ ...BLOG_POSTING, keywords: ["craft", "travel"] }));

		expect(schema.keywords).toBe("craft, travel");
	});

	it("points mainEntityOfPage at the article's own url", () => {
		expect(parse(buildBlogPostingSchema(BLOG_POSTING)).mainEntityOfPage).toEqual({
			"@type": "WebPage",
			"@id": BLOG_POSTING.url,
		});
	});
});

describe("buildBreadcrumbListSchema", () => {
	it("numbers the trail from one and carries each url as the item", () => {
		const schema = parse(
			buildBreadcrumbListSchema([
				{ name: "Home", url: ORIGIN },
				{ name: "Articles", url: `${ORIGIN}/articles` },
			]),
		);

		expect(schema.itemListElement).toEqual([
			{ "@type": "ListItem", position: 1, name: "Home", item: ORIGIN },
			{ "@type": "ListItem", position: 2, name: "Articles", item: `${ORIGIN}/articles` },
		]);
	});
});

describe("buildProfilePageSchema and buildWebSiteSchema", () => {
	it("names the author as a Person on the site schema", () => {
		expect(
			parse(buildWebSiteSchema({ url: ORIGIN, name: "Bianca Fiore", description: "A site", author: AUTHOR })).author,
		).toMatchObject({ "@type": "Person", name: "Bianca Fiore" });
	});

	it("omits the latest article for an author who has written nothing", () => {
		const schema = buildProfilePageSchema({
			person: {
				id: "#bianca",
				name: "Bianca Fiore",
				url: `${ORIGIN}/about`,
				image: `${ORIGIN}/bianca.jpg`,
				jobTitle: "Content writer",
				company: "Freelance",
				sameAs: [],
			},
		});

		expect(schema).not.toContain("BlogPosting");
	});
});
