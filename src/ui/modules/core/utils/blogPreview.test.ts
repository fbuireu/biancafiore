import { beforeEach, describe, expect, it, vi } from "vitest";

interface ListedItem {
	url: string;
}

const entries = vi.hoisted(() => [
	{ data: { slug: "first" } },
	{ data: { slug: "second" } },
	{ data: { slug: "third" } },
	{ data: { slug: "fourth" } },
	{ data: { slug: "fifth" } },
]);

vi.mock("astro:content", () => ({ getCollection: vi.fn(async () => entries) }));

const { blogPreview } = await import("./blogPreview");

describe("blogPreview", () => {
	beforeEach(() => vi.clearAllMocks());

	it("takes the head of the collection, in the order the collection stored", async () => {
		const { articles } = await blogPreview(3);

		expect(articles.map(({ data }) => data.slug)).toEqual(["first", "second", "third"]);
	});

	it("describes exactly the articles it hands the template, so the markup and the schema cannot disagree", async () => {
		const { articles, itemListSchema } = await blogPreview(2);

		const { itemListElement } = JSON.parse(itemListSchema);

		expect(itemListElement).toHaveLength(articles.length);
		expect(itemListElement.map(({ url }: ListedItem) => url)).toEqual([
			"https://biancafiore.test/articles/first",
			"https://biancafiore.test/articles/second",
		]);
	});

	it("answers everything it has rather than padding when the Blog is shorter than the ask", async () => {
		const { articles } = await blogPreview(50);

		expect(articles).toHaveLength(entries.length);
	});
});
