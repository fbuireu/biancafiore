import { resolveArticle, resolveArticles } from "@modules/core/utils/entries";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { stored, asked } = vi.hoisted(() => ({
	stored: new Map<string, unknown>(),
	asked: [] as string[],
}));

vi.mock("astro:content", () => ({
	getEntry: async (collection: string, id: string) => {
		asked.push(`${collection}:${id}`);

		return stored.get(`${collection}:${id}`);
	},
}));

const store = (...slugs: string[]) => {
	for (const slug of slugs) {
		stored.set(`articles:${slug}`, { id: slug, collection: "articles", data: { slug } });
	}
};

const reference = (id: string) => ({ id, collection: "articles" }) as const;

const slugsOf = (entries: { data: { slug: string } }[]) => entries.map(({ data }) => data.slug);

beforeEach(() => {
	stored.clear();
	asked.length = 0;
});

describe("resolveArticle", () => {
	it("answers the entry a reference points at", async () => {
		store("a-piece");

		expect(await resolveArticle(reference("a-piece"))).toMatchObject({ data: { slug: "a-piece" } });
	});

	it("answers undefined for a reference nothing resolves", async () => {
		expect(await resolveArticle(reference("unpublished"))).toBeUndefined();
	});

	it("answers undefined without asking when there is no reference at all", async () => {
		expect(await resolveArticle(undefined)).toBeUndefined();
		expect(asked).toEqual([]);
	});
});

describe("resolveArticles", () => {
	it("keeps the order the collection stored, not the order they resolve in", async () => {
		store("third", "first", "second");

		const articles = await resolveArticles([reference("third"), reference("first"), reference("second")]);

		expect(slugsOf(articles)).toEqual(["third", "first", "second"]);
	});

	it("drops what no longer exists rather than answering a hole", async () => {
		store("kept", "also-kept");

		const articles = await resolveArticles([reference("kept"), reference("deleted"), reference("also-kept")]);

		expect(slugsOf(articles)).toEqual(["kept", "also-kept"]);
	});

	it("asks for nothing when the reference list is empty", async () => {
		expect(await resolveArticles([])).toEqual([]);
		expect(asked).toEqual([]);
	});
});
