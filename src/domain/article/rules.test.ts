import {
	deriveDescription,
	deriveVariant,
	generateTableOfContents,
	getReadingTime,
	isTableOfContentsHeading,
	sortFavoriteFirst,
} from "@domain/article/rules";
import type { ArticleDTO, ArticleHeading } from "@domain/article/types";
import { ArticleType } from "@domain/article/types";
import { describe, expect, it } from "vitest";

interface ArticleStubParams {
	slug: string;
	isFavorite: boolean;
	publishDateISO: string;
}

const articleStub = ({ slug, isFavorite, publishDateISO }: ArticleStubParams): ArticleDTO =>
	({ slug, isFavorite, publishDateISO }) as ArticleDTO;

const headingStub = (level: number, text: string): ArticleHeading => ({
	level,
	id: text.toLowerCase().replaceAll(" ", "-"),
	text,
});

const words = (count: number): string => Array.from({ length: count }, () => "word").join(" ");

describe("getReadingTime", () => {
	it("rounds a text of exactly 200 words up to a single minute", () => {
		expect(getReadingTime(words(200))).toBe(1);
	});

	it("crosses into a second minute at the 201st word", () => {
		expect(getReadingTime(words(201))).toBe(2);
	});

	it("keeps 400 words at two minutes and rounds 401 up to three", () => {
		expect(getReadingTime(words(400))).toBe(2);
		expect(getReadingTime(words(401))).toBe(3);
	});

	it("floors an empty body at one minute, because both bylines print the number unconditionally", () => {
		expect(getReadingTime("")).toBe(1);
	});

	it("floors a body that is markup and whitespace only, which is what a tags-only draft renders as", () => {
		expect(getReadingTime("<p></p>")).toBe(1);
		expect(getReadingTime("<article>\n\t<p>  </p>\n</article>")).toBe(1);
	});

	it("ignores html markup when counting words", () => {
		expect(getReadingTime(`<p>${words(200)}</p>`)).toBe(1);
		expect(getReadingTime(`<article><p>${words(201)}</p></article>`)).toBe(2);
	});

	it("treats a run of whitespace as a single separator instead of counting empty words", () => {
		expect(getReadingTime(words(200).replace(/ /g, "  "))).toBe(1);
		expect(getReadingTime(words(201).replace(/ /g, "\n\n\t"))).toBe(2);
	});

	it("ignores the whitespace markup leaves around the text", () => {
		expect(getReadingTime(`\n  <article>\n\t<p>${words(200)}</p>\n</article>\n`)).toBe(1);
	});

	it("keeps words apart when tags are the only thing between them", () => {
		const paragraphs = Array.from({ length: 400 }, () => "<p>word</p>").join("");

		expect(getReadingTime(paragraphs)).toBe(2);
	});

	it("counts the words of a paragraph list rather than the paragraphs", () => {
		const paragraphs = Array.from({ length: 21 }, () => `<p>${words(10)}</p>`).join("");

		expect(getReadingTime(paragraphs)).toBe(2);
	});
});

describe("isTableOfContentsHeading", () => {
	it("admits every level from h2 to h6", () => {
		expect([2, 3, 4, 5, 6].filter((level) => !isTableOfContentsHeading(level))).toEqual([]);
	});

	it("turns h1 away, because it belongs to the page title and not to the outline", () => {
		expect(isTableOfContentsHeading(1)).toBe(false);
	});

	it("turns away a level no heading tag has", () => {
		expect(isTableOfContentsHeading(0)).toBe(false);
		expect(isTableOfContentsHeading(7)).toBe(false);
	});
});

describe("generateTableOfContents", () => {
	it("returns an empty table for an article with no headings", () => {
		expect(generateTableOfContents([])).toEqual([]);
	});

	it("shifts heading levels down by one, so h2 is the top level", () => {
		expect(
			generateTableOfContents([headingStub(2, "Intro"), headingStub(3, "Detail"), headingStub(6, "Aside")]),
		).toEqual([
			{ id: "intro", heading: "Intro", level: 1 },
			{ id: "detail", heading: "Detail", level: 2 },
			{ id: "aside", heading: "Aside", level: 5 },
		]);
	});

	it("keeps the headings in document order rather than sorting them by level", () => {
		const items = generateTableOfContents([headingStub(4, "Third"), headingStub(2, "First"), headingStub(3, "Second")]);

		expect(items.map(({ heading }) => heading)).toEqual(["Third", "First", "Second"]);
	});

	it("ignores h1, which belongs to the page title and not to the table of contents", () => {
		expect(generateTableOfContents([headingStub(1, "Title"), headingStub(2, "Section")])).toEqual([
			{ id: "section", heading: "Section", level: 1 },
		]);
	});

	it("takes the anchor id the renderer wrote instead of deriving a second one from the text", () => {
		const [entry] = generateTableOfContents([{ level: 2, id: "tips-tricks", text: "Tips & Tricks" }]);

		expect(entry.id).toBe("tips-tricks");
	});

	it("carries the heading text as the author typed it, with no markup or entity left to undo", () => {
		expect(
			generateTableOfContents([
				{ level: 2, id: "why-how", text: "Why & How" },
				{ level: 2, id: "using-script-tags", text: "Using <script> Tags" },
			]).map(({ heading }) => heading),
		).toEqual(["Why & How", "Using <script> Tags"]);
	});

	it("numbers its entries as the body numbers its sections, since both count the same headings", () => {
		const items = generateTableOfContents([
			headingStub(1, "Title"),
			headingStub(2, "First"),
			headingStub(3, "Second"),
			headingStub(2, "Third"),
		]);

		expect(items.map(({ heading }, index) => `--section-${index + 1}: ${heading}`)).toEqual([
			"--section-1: First",
			"--section-2: Second",
			"--section-3: Third",
		]);
	});

	it("leaves the headings it was handed untouched", () => {
		const headings = [headingStub(2, "Section")];

		generateTableOfContents(headings);

		expect(headings).toEqual([{ level: 2, id: "section", text: "Section" }]);
	});
});

describe("deriveDescription", () => {
	it("strips markup and collapses the whitespace it leaves behind", () => {
		expect(deriveDescription("<p>Hello   <strong>world</strong></p>")).toBe("Hello world");
	});

	it("returns an empty string for input that is only markup and whitespace", () => {
		expect(deriveDescription("<p>   </p>\n\t")).toBe("");
	});

	it("leaves a description of exactly 200 characters untouched", () => {
		const exactly = "a".repeat(200);

		expect(deriveDescription(exactly)).toBe(exactly);
	});

	it("truncates at 200 characters and appends an ellipsis from the 201st character on", () => {
		const truncated = deriveDescription("a".repeat(201));

		expect(truncated).toBe(`${"a".repeat(200)}...`);
		expect(truncated).toHaveLength(203);
	});

	it("cuts mid-word rather than at a word boundary", () => {
		expect(deriveDescription(`${"a".repeat(198)} bcdef`)).toBe(`${"a".repeat(198)} b...`);
	});

	it("measures the length after cleaning, so markup does not count towards the limit", () => {
		const body = "a".repeat(200);

		expect(deriveDescription(`<strong>${body}</strong>`)).toBe(body);
	});
});

describe("deriveVariant", () => {
	it("renders an article with a featured image as the default variant", () => {
		expect(deriveVariant(true)).toBe(ArticleType.DEFAULT);
	});

	it("falls back to the imageless variant when there is no featured image", () => {
		expect(deriveVariant(false)).toBe(ArticleType.NO_IMAGE);
	});
});

describe("sortFavoriteFirst", () => {
	it("puts every favorite ahead of every non-favorite regardless of date", () => {
		const sorted = sortFavoriteFirst([
			articleStub({ slug: "recent", isFavorite: false, publishDateISO: "2026-01-01" }),
			articleStub({ slug: "old-favorite", isFavorite: true, publishDateISO: "2019-01-01" }),
		]);

		expect(sorted.map(({ slug }) => slug)).toEqual(["old-favorite", "recent"]);
	});

	it("orders each group from newest to oldest publish date", () => {
		const sorted = sortFavoriteFirst([
			articleStub({ slug: "b", isFavorite: false, publishDateISO: "2024-05-01" }),
			articleStub({ slug: "a", isFavorite: false, publishDateISO: "2025-05-01" }),
			articleStub({ slug: "c", isFavorite: false, publishDateISO: "2023-05-01" }),
		]);

		expect(sorted.map(({ slug }) => slug)).toEqual(["a", "b", "c"]);
	});

	it("preserves the original order of articles that tie on both favorite and date", () => {
		const tied = ["first", "second", "third", "fourth"].map((slug) =>
			articleStub({ slug, isFavorite: false, publishDateISO: "2025-01-01" }),
		);

		expect(sortFavoriteFirst(tied).map(({ slug }) => slug)).toEqual(["first", "second", "third", "fourth"]);
	});

	it("returns a new array and leaves the input untouched", () => {
		const articles = [
			articleStub({ slug: "plain", isFavorite: false, publishDateISO: "2025-01-01" }),
			articleStub({ slug: "starred", isFavorite: true, publishDateISO: "2020-01-01" }),
		];
		const sorted = sortFavoriteFirst(articles);

		expect(sorted).not.toBe(articles);
		expect(articles.map(({ slug }) => slug)).toEqual(["plain", "starred"]);
	});

	it("handles an empty list without failing", () => {
		expect(sortFavoriteFirst([])).toEqual([]);
	});

	it("orders anything carrying the two fields it reads, which is what lets the tag index share the rule", () => {
		const references = [
			{ id: "recent", isFavorite: false, publishDateISO: "2026-01-01" },
			{ id: "old-favorite", isFavorite: true, publishDateISO: "2019-01-01" },
		];

		expect(sortFavoriteFirst(references).map(({ id }) => id)).toEqual(["old-favorite", "recent"]);
	});
});
