import { rawEntry } from "@tests/doubles/cmsEntries";
import { describe, expect, it } from "vitest";
import type { ArticleFields } from "../types";
import { orderArticleReferences } from "./order";

interface MakeArticleParams {
	slug: string;
	publishDate?: string;
	isFavorite?: boolean;
}

const DEFAULT_PUBLISH_DATE = "2024-03-15";

const makeArticle = ({ slug, publishDate = DEFAULT_PUBLISH_DATE, isFavorite }: MakeArticleParams) =>
	rawEntry<ArticleFields>({
		slug,
		data: { title: slug, content: [], publish_date: publishDate, is_favorite: isFavorite },
	});

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

	it("compares dates as instants rather than as the strings the CMS sent", () => {
		const ordered = orderArticleReferences([
			makeArticle({ slug: "earlier", publishDate: "2024-01-02T00:00:00Z" }),
			makeArticle({ slug: "later", publishDate: "2024-01-02T12:00:00Z" }),
		]);

		expect(idsOf(ordered)).toEqual(["later", "earlier"]);
	});

	it("refuses an unparseable publish date, the way the article mapper already does", () => {
		expect(() =>
			orderArticleReferences([
				makeArticle({ slug: "nonsense", publishDate: "not-a-date" }),
				makeArticle({ slug: "dated", publishDate: "2019-01-01" }),
			]),
		).toThrow('The Article "nonsense" (id id-nonsense) has an unreadable publish date (not-a-date)');
	});

	it("refuses an undated favourite too, since being one does not date it", () => {
		expect(() =>
			orderArticleReferences([
				makeArticle({ slug: "dated", publishDate: "2026-01-01" }),
				makeArticle({ slug: "undated-favourite", publishDate: "", isFavorite: true }),
			]),
		).toThrow("has an unreadable publish date");
	});

	it("references an article by its trimmed slug, the id the collection is keyed on", () => {
		expect(idsOf(orderArticleReferences([makeArticle({ slug: "  padded  " })]))).toEqual(["padded"]);
	});

	it("answers nothing for an empty batch", () => {
		expect(orderArticleReferences([])).toEqual([]);
	});
});
