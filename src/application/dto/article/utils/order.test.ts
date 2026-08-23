import type { RawArticle } from "@application/dto/article/types";
import { orderArticleReferences } from "@application/dto/article/utils/order";
import { describe, expect, it, vi } from "vitest";

vi.mock("astro:content", () => ({ reference: () => ({ parse: (value: unknown) => value }) }));

interface MakeArticleParams {
	slug: string;
	publishDate?: string | null;
	isFavorite?: boolean;
}

const DEFAULT_PUBLISH_DATE = "2024-03-15";

const makeArticle = ({ slug, publishDate = DEFAULT_PUBLISH_DATE, isFavorite }: MakeArticleParams) =>
	({ fields: { slug, publishDate: publishDate ?? undefined, isFavorite } }) as unknown as RawArticle;

const idsOf = (references: { id: string }[]) => references.map(({ id }) => id);

describe("orderArticleReferences", () => {
	it("answers articles collection references, so no caller writes that literal", () => {
		expect(orderArticleReferences([makeArticle({ slug: "a-piece" })])).toEqual([
			{ id: "a-piece", collection: "articles" },
		]);
	});

	it("puts the favourites first, whatever order they arrived in", () => {
		const ordered = orderArticleReferences([
			makeArticle({ slug: "newest", publishDate: "2026-01-01" }),
			makeArticle({ slug: "old-favourite", publishDate: "2019-01-01", isFavorite: true }),
		]);

		expect(idsOf(ordered)).toEqual(["old-favourite", "newest"]);
	});

	it("orders the rest newest first", () => {
		const ordered = orderArticleReferences([
			makeArticle({ slug: "middle", publishDate: "2024-06-01" }),
			makeArticle({ slug: "oldest", publishDate: "2019-03-01" }),
			makeArticle({ slug: "newest", publishDate: "2026-07-30" }),
		]);

		expect(idsOf(ordered)).toEqual(["newest", "middle", "oldest"]);
	});

	it("compares dates as instants rather than as the strings Contentful sent", () => {
		const ordered = orderArticleReferences([
			makeArticle({ slug: "earlier", publishDate: "2024-01-02T00:00:00Z" }),
			makeArticle({ slug: "later", publishDate: "2024-01-02T12:00:00Z" }),
		]);

		expect(idsOf(ordered)).toEqual(["later", "earlier"]);
	});

	it("sorts an article the CMS gave no publish date last, rather than throwing on it", () => {
		const ordered = orderArticleReferences([
			makeArticle({ slug: "undated", publishDate: null }),
			makeArticle({ slug: "dated", publishDate: "2019-01-01" }),
		]);

		expect(idsOf(ordered)).toEqual(["dated", "undated"]);
	});

	it("sorts an unparseable publish date last for the same reason", () => {
		const ordered = orderArticleReferences([
			makeArticle({ slug: "nonsense", publishDate: "not-a-date" }),
			makeArticle({ slug: "dated", publishDate: "2019-01-01" }),
		]);

		expect(idsOf(ordered)).toEqual(["dated", "nonsense"]);
	});

	it("still puts an undated favourite ahead of a dated article that is not one", () => {
		const ordered = orderArticleReferences([
			makeArticle({ slug: "dated", publishDate: "2026-01-01" }),
			makeArticle({ slug: "undated-favourite", publishDate: null, isFavorite: true }),
		]);

		expect(idsOf(ordered)).toEqual(["undated-favourite", "dated"]);
	});

	it("references an article by its trimmed slug, the id the collection is keyed on", () => {
		expect(idsOf(orderArticleReferences([makeArticle({ slug: "  padded  " })]))).toEqual(["padded"]);
	});

	it("answers nothing for an empty batch", () => {
		expect(orderArticleReferences([])).toEqual([]);
	});
});
