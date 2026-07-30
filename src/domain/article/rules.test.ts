import {
	deriveDescription,
	deriveVariant,
	generateTableOfContents,
	getReadingTime,
	sortFavoriteFirst,
} from "@domain/article/rules";
import type { ArticleDTO } from "@domain/article/types";
import { ArticleType } from "@domain/article/types";
import { describe, expect, it } from "vitest";

interface ArticleStubParams {
	slug: string;
	isFavorite: boolean;
	publishDateISO: string;
}

const articleStub = ({ slug, isFavorite, publishDateISO }: ArticleStubParams): ArticleDTO =>
	({ slug, isFavorite, publishDateISO }) as ArticleDTO;

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

	it("never reports less than one minute, even for empty content", () => {
		expect(getReadingTime("")).toBe(1);
	});

	it("ignores html markup when counting words", () => {
		expect(getReadingTime(`<p>${words(200)}</p>`)).toBe(1);
		expect(getReadingTime(`<article><p>${words(201)}</p></article>`)).toBe(2);
	});

	it("counts each whitespace character as a separator, so runs of whitespace inflate the count", () => {
		expect(getReadingTime(words(200).replace(/ /g, "  "))).toBe(2);
	});

	it("welds words together when tags are the only thing between them", () => {
		const paragraphs = Array.from({ length: 400 }, () => "<p>word</p>").join("");

		expect(getReadingTime(paragraphs)).toBe(1);
	});
});

describe("generateTableOfContents", () => {
	it("returns an empty table for content with no headings", () => {
		expect(generateTableOfContents("<p>Just a paragraph</p>")).toEqual([]);
	});

	it("shifts heading levels down by one, so h2 is the top level", () => {
		expect(generateTableOfContents("<h2>Intro</h2><h3>Detail</h3><h6>Aside</h6>")).toEqual([
			{ id: "intro", heading: "Intro", level: 1 },
			{ id: "detail", heading: "Detail", level: 2 },
			{ id: "aside", heading: "Aside", level: 5 },
		]);
	});

	it("keeps the headings in document order rather than sorting them by level", () => {
		const items = generateTableOfContents("<h4>Third</h4><h2>First</h2><h3>Second</h3>");

		expect(items.map(({ heading }) => heading)).toEqual(["Third", "First", "Second"]);
	});

	it("ignores h1, which belongs to the page title and not to the table of contents", () => {
		expect(generateTableOfContents("<h1>Title</h1><h2>Section</h2>")).toEqual([
			{ id: "section", heading: "Section", level: 1 },
		]);
	});

	it("matches each heading separately instead of spanning from the first to the last", () => {
		expect(generateTableOfContents("<h2>One</h2><h2>Two</h2>").map(({ heading }) => heading)).toEqual(["One", "Two"]);
	});

	it("requires the closing tag to match the opening level", () => {
		expect(generateTableOfContents("<h2>Mismatched</h3>")).toEqual([]);
	});

	it("skips headings that carry attributes", () => {
		expect(generateTableOfContents('<h2 id="already-there">Section</h2>')).toEqual([]);
	});

	it("skips headings whose text spans more than one line", () => {
		expect(generateTableOfContents("<h2>Broken\nacross lines</h2>")).toEqual([]);
	});

	it("slugifies the id while keeping the heading text verbatim, inline markup included", () => {
		expect(generateTableOfContents("<h2>Deploying <code>astro</code></h2>")).toEqual([
			{ id: "deploying-codeastrocode", heading: "Deploying <code>astro</code>", level: 1 },
		]);
	});

	it("collapses the hyphens left behind by punctuation in the generated id", () => {
		expect(generateTableOfContents("<h2>Why &amp; How</h2>")[0]?.id).toBe("why-amp-how");
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
});
