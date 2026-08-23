import { beforeEach, describe, expect, it, vi } from "vitest";

const entries = vi.hoisted(() => [
	{ data: { slug: "first" } },
	{ data: { slug: "second" } },
	{ data: { slug: "third" } },
	{ data: { slug: "fourth" } },
	{ data: { slug: "fifth" } },
]);

vi.mock("astro:content", () => ({ getCollection: vi.fn(async () => entries) }));

const { blogTeaser } = await import("@modules/core/utils/blogTeaser");

describe("blogTeaser", () => {
	beforeEach(() => vi.clearAllMocks());

	it("takes the head of the collection, in the order the collection stored", async () => {
		const { articles } = await blogTeaser(3);

		expect(articles.map(({ data }) => data.slug)).toEqual(["first", "second", "third"]);
	});

	it("describes exactly the articles it hands the template, so the markup and the schema cannot disagree", async () => {
		const { articles, itemListSchema } = await blogTeaser(2);

		const { itemListElement } = JSON.parse(itemListSchema);

		expect(itemListElement).toHaveLength(articles.length);
		expect(itemListElement.map(({ url }: { url: string }) => url)).toEqual([
			"https://biancafiore.test/articles/first",
			"https://biancafiore.test/articles/second",
		]);
	});

	it("answers everything it has rather than padding when the Blog is shorter than the ask", async () => {
		const { articles } = await blogTeaser(50);

		expect(articles).toHaveLength(entries.length);
	});
});
