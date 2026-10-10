import { IMAGE_CDN } from "@const/index";
import { MEDIA_FILE_PATH } from "@infrastructure/cms/media";
import { BLURHASH, rawEntry } from "@tests/doubles/cmsEntries";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PortableTextContent } from "../../shared/portableText";
import type { ArticleFields } from "../types";
import { renderArticleContent } from "./content";

const IMAGE_URL = `${MEDIA_FILE_PATH}hero.jpg`;

afterEach(() => {
	vi.unstubAllEnvs();
});

let key = 0;
const nextKey = () => `k${key++}`;

interface SpanParams {
	text: string;
	marks?: string[];
}

const span = ({ text, marks = [] }: SpanParams) => ({ _type: "span", _key: nextKey(), text, marks });

interface BlockParams {
	text?: string;
	style?: string;
	children?: ReturnType<typeof span>[];
	markDefs?: Record<string, unknown>[];
}

const block = ({ text = "", style = "normal", children = [span({ text })], markDefs = [] }: BlockParams) => ({
	_type: "block",
	_key: nextKey(),
	style,
	children,
	markDefs,
});

const paragraph = (text: string) => block({ text });

interface HeadingParams {
	level: number;
	value: string;
}

const heading = ({ level, value }: HeadingParams) => block({ text: value, style: `h${level}` });

interface LinkedParams {
	href: string;
	label?: string;
}

const linked = ({ href, label = "a link" }: LinkedParams) =>
	block({ children: [span({ text: label, marks: ["link-1"] })], markDefs: [{ _type: "link", _key: "link-1", href }] });

interface TypedParams extends Record<string, unknown> {
	_type: string;
}

const typed = (fields: TypedParams) => ({ _key: nextKey(), ...fields });

const makeArticle = (content: unknown[]) =>
	rawEntry<ArticleFields>({
		slug: "an-article",
		data: { title: "An article", content: content as PortableTextContent, publish_date: "2024-01-01" },
	});

const render = (content: unknown[]) => renderArticleContent(makeArticle(content)).content;

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

		expect(headings.map(({ text }) => text)).toEqual(["Third", "First", "Second"]);
	});

	it("renders an h1 but collects nothing for it, so the page title stays out of the Table of Contents", () => {
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

	it("reads a heading's text across every span, whatever marks the editor put on them", () => {
		const { headings } = renderArticleContent(
			makeArticle([
				block({ style: "h2", children: [span({ text: "Bold ", marks: ["strong"] }), span({ text: "and plain" })] }),
			]),
		);

		expect(headings.map(({ text }) => text)).toEqual(["Bold and plain"]);
	});

	it("gives a heading that repeats an earlier one its own anchor, so the table of contents jumps to each", () => {
		const { content, headings } = renderArticleContent(
			makeArticle([
				heading({ level: 2, value: "Conclusion" }),
				heading({ level: 2, value: "Conclusion" }),
				heading({ level: 3, value: "Conclusion" }),
			]),
		);

		expect(headings.map(({ id }) => id)).toEqual(["conclusion", "conclusion-2", "conclusion-3"]);
		expect(content).toContain('<h2 id="conclusion-2" class="article__heading flex align-baseline">');
		expect(content).toContain('<a href="#conclusion-3">Conclusion</a>');
	});

	it("counts the h1 among the anchors too, since every heading id lives in the one document", () => {
		const { content, headings } = renderArticleContent(
			makeArticle([heading({ level: 1, value: "Title" }), heading({ level: 2, value: "Title" })]),
		);

		expect(content).toContain('<h1 id="title"');
		expect(headings.map(({ id }) => id)).toEqual(["title-2"]);
	});

	it("never hands a heading an anchor an earlier heading already spells", () => {
		const { headings } = renderArticleContent(
			makeArticle([
				heading({ level: 2, value: "A" }),
				heading({ level: 2, value: "A" }),
				heading({ level: 2, value: "A 2" }),
			]),
		);

		expect(headings.map(({ id }) => id)).toEqual(["a", "a-2", "a-2-2"]);
	});

	it.each([
		["only punctuation", "?!"],
		["a script slugify strips whole", "Ελληνικά"],
		["a script slugify strips whole", "日本語"],
	])("gives a heading of %s (%s) an anchor rather than an empty id", (_name, value) => {
		const { content, headings } = renderArticleContent(makeArticle([heading({ level: 2, value })]));

		expect(headings.map(({ id }) => id)).toEqual(["section"]);
		expect(content).toContain('<h2 id="section"');
		expect(content).not.toContain('id=""');
	});

	it("numbers the headings that fall back to a section anchor, so each stays addressable", () => {
		const { headings } = renderArticleContent(
			makeArticle([heading({ level: 2, value: "日本語" }), heading({ level: 2, value: "?!" })]),
		);

		expect(headings.map(({ id }) => id)).toEqual(["section", "section-2"]);
	});

	it("answers with an empty heading list for a body that has none", () => {
		const { content, headings } = renderArticleContent(makeArticle([paragraph("Just prose")]));

		expect(headings).toEqual([]);
		expect(content).toContain("<p>Just prose</p>");
	});

	it("starts a fresh heading list per article rather than accumulating across calls", () => {
		const article = makeArticle([heading({ level: 2, value: "Section" })]);

		renderArticleContent(article);
		renderArticleContent(article);

		expect(renderArticleContent(article).headings).toHaveLength(1);
	});
});

describe("renderArticleContent marks", () => {
	it("renders the marks the editor offers as their own elements", () => {
		const html = render([
			block({
				children: ["strong", "em", "underline", "strike-through", "code", "superscript", "subscript"].map((mark) =>
					span({ text: mark, marks: [mark] }),
				),
			}),
		]);

		expect(html).toBe(
			"<p><strong>strong</strong><em>em</em><u>underline</u><del>strike-through</del><code>code</code><sup>superscript</sup><sub>subscript</sub></p>",
		);
	});

	it("keeps the text of a mark it does not know rather than wrapping it in a warning", () => {
		expect(render([block({ children: [span({ text: "plain", marks: ["sparkle"] })] })])).toBe("<p>plain</p>");
	});

	it("escapes the text an editor wrote", () => {
		expect(render([paragraph("<script>alert(1)</script>")])).toContain("&lt;script&gt;");
	});

	it("wraps a quote in a paragraph, the shape the article styles expect", () => {
		expect(render([block({ text: "Quoted", style: "blockquote" })])).toBe("<blockquote><p>Quoted</p></blockquote>");
	});

	it("renders a divider as a rule", () => {
		expect(render([typed({ _type: "break", style: "lineBreak" })])).toBe("<hr/>");
	});
});

describe("renderArticleContent links", () => {
	it("opens a link to somewhere else in a new tab, and says so to a screen reader", () => {
		const html = render([linked({ href: "https://example.com/a" })]);

		expect(html).toContain('target="_blank"');
		expect(html).toContain('rel="noopener noreferrer"');
		expect(html).toContain('aria-hidden="true" class="external-link-icon"');
	});

	it("keeps a link to our own page in the same tab, with no external cue", () => {
		const html = render([linked({ href: "https://biancafiore.me/about" })]);

		expect(html).toContain('<a href="https://biancafiore.me/about">');
		expect(html).not.toContain("external-link-icon");
	});

	it("treats a relative link as our own, whatever environment it renders in", () => {
		expect(render([linked({ href: "/articles/a-piece", label: "A piece" })])).toContain(
			'<a href="/articles/a-piece">A piece</a>',
		);
	});

	it("opens a link to a tag page in a new tab, but gives it no external cue", () => {
		const html = render([linked({ href: "https://biancafiore.me/tags/craft" })]);

		expect(html).toContain('target="_blank"');
		expect(html).not.toContain("external-link-icon");
	});

	it("refuses a javascript: link an editor typed, leaving the href empty rather than live", () => {
		const html = render([linked({ href: "javascript:alert(1)" })]);

		expect(html).toContain('href=""');
		expect(html).not.toContain("alert(1)");
	});

	it("escapes a quote in a link, so it cannot close the attribute carrying it", () => {
		const html = render([linked({ href: 'https://example.com/?q="onerror=x' })]);

		expect(html).not.toContain('?q="onerror');
		expect(html).toContain("&quot;");
	});

	it("keeps a link's label but links nowhere when the editor typed an address no URL can be made of", () => {
		const html = render([linked({ href: "https://exa mple.com" })]);

		expect(html).toBe("<p>a link</p>");
	});

	it("keeps a link's label but links nowhere when its definition carries no href", () => {
		const html = render([
			block({ children: [span({ text: "label", marks: ["link-1"] })], markDefs: [{ _type: "link", _key: "link-1" }] }),
		]);

		expect(html).toContain("label");
		expect(html).not.toContain("<a href");
	});
});

describe("renderArticleContent video and iframe embeds", () => {
	it("turns a youtube watch url into its embed url, which is what an iframe can load", () => {
		const html = render([
			typed({ _type: "videoEmbed", url: "https://www.youtube.com/watch?v=abc123", title: "A talk" }),
		]);

		expect(html).toContain('src="https://www.youtube.com/embed/abc123"');
	});

	it("turns a youtu.be short url into the same embed url", () => {
		const html = render([typed({ _type: "videoEmbed", url: "https://youtu.be/abc123", title: "A talk" })]);

		expect(html).toContain('src="https://www.youtube.com/embed/abc123"');
	});

	it("leaves a url it does not recognise alone rather than mangling it", () => {
		expect(render([typed({ _type: "videoEmbed", url: "https://vimeo.com/12345", title: "A talk" })])).toContain(
			'src="https://vimeo.com/12345"',
		);
	});

	it("leaves an unparseable url alone rather than throwing on it", () => {
		expect(render([typed({ _type: "videoEmbed", url: "not a url", title: "A talk" })])).toContain('src="not a url"');
	});

	it("escapes the title an editor gave a video", () => {
		const html = render([typed({ _type: "videoEmbed", url: "https://youtu.be/a", title: 'x" onload="y' })]);

		expect(html).not.toContain('onload="y"');
		expect(html).toContain("&quot;");
	});

	it("renders nothing for a video the editor left without a title", () => {
		expect(render([typed({ _type: "videoEmbed", url: "https://youtu.be/a" })])).not.toContain("<iframe");
	});

	it("refuses a javascript: iframe source, leaving the src empty rather than live", () => {
		const html = render([typed({ _type: "iframe", src: "javascript:alert(1)" })]);

		expect(html).toContain('src=""');
		expect(html).not.toContain("alert(1)");
	});

	it("wraps a generic iframe in the block the article stylesheet sizes it through, and a video in nothing", () => {
		const generic = render([typed({ _type: "iframe", src: "https://example.com/widget", title: "A widget" })]);
		const video = render([typed({ _type: "videoEmbed", url: "https://youtu.be/a", title: "A talk" })]);

		expect(generic).toContain('<div class="iframe-embed"><iframe src="https://example.com/widget"');
		expect(generic).toContain("</iframe></div>");
		expect(video).not.toContain("iframe-embed");
	});

	it("renders an iframe with no title rather than the string undefined", () => {
		expect(render([typed({ _type: "iframe", src: "https://example.com/widget" })])).toContain('title=""');
	});
});

describe("renderArticleContent images", () => {
	const image = (fields: Record<string, unknown> = {}) =>
		typed({ _type: "image", asset: { _ref: "01MEDIA", url: IMAGE_URL }, width: 1200, height: 630, ...fields });

	it("carries the media's own dimensions onto the img, so the page reserves the space", () => {
		const html = render([image()]);

		expect(html).toContain('width="1200"');
		expect(html).toContain('height="630"');
	});

	it("emits a srcset, so a narrow screen does not download the widest crop", () => {
		const html = render([image()]);

		expect(html).toContain("srcset=");
		expect(html).toContain(" 400w");
	});

	it("takes the alt text the editor wrote, and falls back to the Article's own title", () => {
		expect(render([image({ alt: "A described image" })])).toContain('alt="A described image"');
		expect(render([image()])).toContain('alt="An article"');
	});

	it("escapes an alt that carries markup", () => {
		const html = render([image({ alt: 'A "quoted" <b>bay</b>' })]);

		expect(html).toContain("&quot;quoted&quot;");
		expect(html).not.toContain("<b>bay</b>");
	});

	it("renders a caption only when the editor wrote one, escaped", () => {
		expect(render([image({ caption: "The caption" })])).toContain("<figcaption>The caption</figcaption>");
		expect(render([image()])).not.toContain("<figcaption>");
		expect(render([image({ caption: "<script>alert(1)</script>" })])).toContain("&lt;script&gt;");
	});

	it("blurs an image in until it loads, from the blurhash EmDash stores on the block", () => {
		const html = render([image({ blurhash: BLURHASH })]);

		expect(html).toContain('<span class="blur-image" style="--lqip: url(&quot;data:image/bmp;base64,');
		expect(html).toMatch(/<span class="blur-image"[^>]*>\s*<img/);
	});

	it("reads a blurhash an older block kept in its asset's meta", () => {
		expect(render([image({ asset: { _ref: "01MEDIA", url: IMAGE_URL, meta: { blurhash: BLURHASH } } })])).toContain(
			'class="blur-image"',
		);
	});

	it.each([
		["no blurhash", {}],
		["no dimensions to shape the placeholder", { blurhash: BLURHASH, width: undefined, height: undefined }],
	])("renders the image unwrapped with %s", (_case, fields) => {
		expect(render([image(fields)])).not.toContain("blur-image");
	});

	it("wraps an image in the class its alignment names", () => {
		expect(render([image({ alignment: "full" })])).toContain('<figure class="full-bleed">');
		expect(render([image({ alignment: "wide" })])).toContain('<figure class="breakout">');
	});

	it("renders no wrapper class for no alignment, or one the site does not lay out", () => {
		expect(render([image()])).toContain("<figure>");
		expect(render([image({ alignment: "center" })])).toContain("<figure>");
	});

	it("renders no wrapper class for an alignment it does not know, even one every object inherits", () => {
		const html = render([image({ alignment: "toString" })]);

		expect(html).toContain("<figure>");
		expect(html).not.toContain("function");
	});

	it("renders media carrying no dimensions rather than dropping it, asking the CDN for a sensible width", () => {
		vi.stubEnv("IMAGE_CDN", IMAGE_CDN.CLOUDFLARE);

		const html = render([image({ width: undefined, height: undefined })]);

		expect(html).toContain('height=""');
		expect(html).toContain('width=""');
		expect(html).toContain("width=768");
	});

	it("renders nothing for an image whose dimensions are not numbers, rather than writing them into the markup", () => {
		expect(render([image({ width: '1" onerror="alert(1)' })])).not.toContain("onerror");
	});

	it("renders an image hosted elsewhere from its absolute url, untransformed", () => {
		const html = render([image({ asset: { _ref: "01MEDIA", url: "https://images.example.com/a.jpg" } })]);

		expect(html).toContain('src="https://images.example.com/a.jpg"');
	});

	it("renders nothing for an image whose source is neither a url nor a path on this origin", () => {
		expect(render([typed({ _type: "image", asset: { _ref: "01MEDIA", url: "a.jpg" } })])).toBe("");
		expect(render([typed({ _type: "image", asset: { _ref: "01MEDIA", url: "//images.example.com/a.jpg" } })])).toBe("");
		expect(render([typed({ _type: "image", asset: { _ref: "01MEDIA" } })])).toBe("");
	});
});

describe("renderArticleContent code, split blocks and tables", () => {
	it("escapes a code block, so a snippet about html does not become html", () => {
		expect(render([typed({ _type: "code", code: "<div onclick='x'>" })])).toContain(
			"<pre><code>&lt;div onclick=&#39;x&#39;&gt;</code></pre>",
		);
	});

	it("renders nothing for a code block with no code", () => {
		expect(render([typed({ _type: "code", code: "" })])).not.toContain("<pre>");
	});

	it("renders a split block's heading and text beside its image, with a srcset and the alt the editor wrote", () => {
		const html = render([
			typed({ _type: "splitBlock", heading: "A heading", text: "Some text", image: IMAGE_URL, alt: "Alt text" }),
		]);

		expect(html).toContain("<h3>A heading</h3>");
		expect(html).toContain("<p>Some text</p>");
		expect(html).toContain('class="split"');
		expect(html).toContain('alt="Alt text"');
		expect(html).toContain("srcset=");
		expect(html).toContain('height=""');
	});

	it("renders an empty alt for a split block's image the editor never described", () => {
		expect(render([typed({ _type: "splitBlock", image: IMAGE_URL })])).toContain('alt=""');
	});

	it("renders nothing for a split block with no image", () => {
		expect(render([typed({ _type: "splitBlock", heading: "Only a heading" })])).toBe("");
	});

	it("renders a table row by row, header cells as th, with the marks inside each cell", () => {
		const html = render([
			typed({
				_type: "table",
				rows: [
					{ _type: "tableRow", cells: [{ _type: "tableCell", isHeader: true, content: [span({ text: "Head" })] }] },
					{
						_type: "tableRow",
						cells: [
							{
								_type: "tableCell",
								content: [span({ text: "link", marks: ["l"] })],
								markDefs: [{ _type: "link", _key: "l", href: "/about" }],
							},
						],
					},
				],
			}),
		]);

		expect(html).toBe(
			'<table><tbody><tr><th><p>Head</p></th></tr><tr><td><p><a href="/about">link</a></p></td></tr></tbody></table>',
		);
	});

	it("resolves a cell's link against the table's own mark definitions, and spans a cell across rows and columns", () => {
		const html = render([
			typed({
				_type: "table",
				markDefs: [{ _type: "link", _key: "t", href: "/about" }],
				rows: [
					{
						_type: "tableRow",
						cells: [{ _type: "tableCell", colspan: 2, rowspan: 3, content: [span({ text: "link", marks: ["t"] })] }],
					},
				],
			}),
		]);

		expect(html).toBe(
			'<table><tbody><tr><td colspan="2" rowspan="3"><p><a href="/about">link</a></p></td></tr></tbody></table>',
		);
	});

	it("renders nothing for a table whose rows are not the shape the editor writes", () => {
		expect(render([typed({ _type: "table", rows: "nope" })])).toBe("");
	});

	it("renders nothing at all for a block of a type it does not know", () => {
		expect(render([typed({ _type: "somethingElse", url: "https://example.com" })])).toBe("");
	});
});
