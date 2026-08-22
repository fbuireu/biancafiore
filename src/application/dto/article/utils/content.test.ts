import type { RawArticle } from "@application/dto/article/types";
import { renderArticleContent } from "@application/dto/article/utils/content";
import { describe, expect, it, vi } from "vitest";

vi.mock("astro:content", () => ({ reference: () => ({ parse: (value: unknown) => value }) }));

const text = (value: string) => ({ nodeType: "text", value, marks: [], data: {} });
const paragraph = (value: string) => ({ nodeType: "paragraph", data: {}, content: [text(value)] });

interface HeadingParams {
	level: number;
	value: string;
}

const heading = ({ level, value }: HeadingParams) => ({
	nodeType: `heading-${level}`,
	data: {},
	content: [text(value)],
});

const makeArticle = (content: unknown[]): RawArticle =>
	({
		sys: {},
		fields: { title: "An article", content: { nodeType: "document", data: {}, content } },
	}) as unknown as RawArticle;

describe("renderArticleContent headings", () => {
	it("collects a heading's level, anchor id, authored text and the scope it stamped on the section", () => {
		const { content, headings } = renderArticleContent(makeArticle([heading({ level: 3, value: "Tips & Tricks" })]));

		expect(headings).toEqual([{ level: 3, id: "tips-tricks", text: "Tips & Tricks", scope: "--section-1" }]);
		expect(content).toContain('<section style="--is: --section-1">');
	});

	it("collects the headings in document order, whatever order their levels come in", () => {
		const { headings } = renderArticleContent(
			makeArticle([
				heading({ level: 4, value: "Third" }),
				paragraph("Body"),
				heading({ level: 2, value: "First" }),
				heading({ level: 3, value: "Second" }),
			]),
		);

		expect(headings.map(({ text: value }) => value)).toEqual(["Third", "First", "Second"]);
	});

	it("renders an h1 but collects nothing for it, so the page title stays out of the outline", () => {
		const { content, headings } = renderArticleContent(
			makeArticle([heading({ level: 1, value: "Title" }), heading({ level: 2, value: "Section" })]),
		);

		expect(headings).toEqual([{ level: 2, id: "section", text: "Section", scope: "--section-1" }]);
		expect(content).toContain('<h1 id="title"');
	});

	it("numbers a section with the place its heading takes in the collected list", () => {
		const { content, headings } = renderArticleContent(
			makeArticle([
				heading({ level: 1, value: "Title" }),
				heading({ level: 2, value: "First" }),
				heading({ level: 3, value: "Second" }),
			]),
		);

		expect(headings).toHaveLength(2);
		expect(content).toContain("<section>\n");
		expect(content).toContain('<section style="--is: --section-1">');
		expect(content).toContain('<section style="--is: --section-2">');
		expect(content).not.toContain("--section-3");
	});

	it("writes the anchor the collected id spells, escaping the text only in the body", () => {
		const { content, headings } = renderArticleContent(
			makeArticle([heading({ level: 2, value: `Why & How <b> "now"` })]),
		);
		const [collected] = headings;

		expect(content).toContain(`<h2 id="${collected.id}" class="article__heading flex align-baseline">`);
		expect(content).toContain(`<a href="#${collected.id}">Why &amp; How &lt;b&gt; &quot;now&quot;</a>`);
		expect(collected.text).toBe(`Why & How <b> "now"`);
	});

	it("answers with an empty heading list for a body that has none", () => {
		const { content, headings } = renderArticleContent(makeArticle([paragraph("Just prose")]));

		expect(headings).toEqual([]);
		expect(content).toContain("<p>Just prose</p>");
	});

	it("starts a fresh heading list per article rather than accumulating across calls", () => {
		const article = makeArticle([heading({ level: 2, value: "Section" })]);

		expect(renderArticleContent(article).headings).toEqual(renderArticleContent(article).headings);
		expect(renderArticleContent(article).headings).toHaveLength(1);
	});
});
