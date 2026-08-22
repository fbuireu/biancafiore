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

		renderArticleContent(article);
		renderArticleContent(article);

		expect(renderArticleContent(article).headings).toHaveLength(1);
	});
});

const hyperlink = (uri: string, label = "a link") => ({
	nodeType: "hyperlink",
	data: { uri },
	content: [text(label)],
});

interface EmbedParams {
	contentType: string;
	fields?: Record<string, unknown>;
	inline?: boolean;
}

const embed = ({ contentType, fields = {}, inline = false }: EmbedParams) => ({
	nodeType: inline ? "embedded-entry-inline" : "embedded-entry-block",
	data: { target: { sys: { contentType: { sys: { id: contentType } } }, fields } },
	content: [],
});

interface EntryHyperlinkParams {
	contentType: string;
	fields: Record<string, unknown>;
	label?: string;
}

const entryHyperlink = ({ contentType, fields, label = "read this" }: EntryHyperlinkParams) => ({
	nodeType: "entry-hyperlink",
	data: { target: { sys: { contentType: { sys: { id: contentType } } }, fields } },
	content: [text(label)],
});

const assetHyperlink = (file: unknown, label = "the file") => ({
	nodeType: "asset-hyperlink",
	data: { target: { fields: { file } } },
	content: [text(label)],
});

interface AssetParams {
	url: string;
	extra?: Record<string, unknown>;
}

const asset = ({ url, extra = {} }: AssetParams) => ({
	url,
	details: { image: { width: 1200, height: 630 } },
	...extra,
});

const render = (content: unknown[]) => renderArticleContent(makeArticle(content)).content;

describe("renderArticleContent hyperlinks", () => {
	it("opens a link to somewhere else in a new tab, and says so to a screen reader", () => {
		const html = render([{ ...paragraph("x"), content: [hyperlink("https://example.com/a")] }]);

		expect(html).toContain('target="_blank"');
		expect(html).toContain('rel="noopener noreferrer"');
		expect(html).toContain('aria-hidden="true" class="external-link-icon"');
	});

	it("keeps a link to our own page in the same tab, with no external cue", () => {
		const html = render([{ ...paragraph("x"), content: [hyperlink("https://biancafiore.me/about")] }]);

		expect(html).toContain('<a href="https://biancafiore.me/about">');
		expect(html).not.toContain("external-link-icon");
	});

	it("treats a relative link as our own, whatever environment it renders in", () => {
		expect(render([{ ...paragraph("x"), content: [hyperlink("/about")] }])).toContain('<a href="/about">');
	});

	it("refuses a javascript: link an editor typed, leaving the href empty rather than live", () => {
		const html = render([{ ...paragraph("x"), content: [hyperlink("javascript:alert(1)")] }]);

		expect(html).toContain('href=""');
		expect(html).not.toContain("alert(1)");
	});

	it("escapes a quote in a link, so it cannot close the attribute carrying it", () => {
		const html = render([{ ...paragraph("x"), content: [hyperlink('https://example.com/?q="onerror=x')] }]);

		expect(html).not.toContain('?q="onerror');
		expect(html).toContain("&quot;");
	});
});

describe("renderArticleContent embedded articles", () => {
	it("links an embedded Article through the routes module rather than a hand-written path", () => {
		const html = render([
			{
				...paragraph("x"),
				content: [embed({ contentType: "article", fields: { slug: "a-piece", title: "A piece" }, inline: true })],
			},
		]);

		expect(html).toContain('<a href="/articles/a-piece">A piece</a>');
	});

	it("renders nothing for an embedded entry that is not an Article", () => {
		const html = render([
			{
				...paragraph("x"),
				content: [embed({ contentType: "author", fields: { slug: "bianca", title: "Bianca" }, inline: true })],
			},
		]);

		expect(html).not.toContain("<a href");
	});

	it("renders nothing for an embedded Article the CMS left without a slug", () => {
		const html = render([
			{ ...paragraph("x"), content: [embed({ contentType: "article", fields: { title: "A piece" }, inline: true })] },
		]);

		expect(html).not.toContain("<a href");
	});

	it("escapes the title of an embedded Article", () => {
		const html = render([
			{
				...paragraph("x"),
				content: [
					embed({ contentType: "article", fields: { slug: "a-piece", title: "Why <b>this</b>" }, inline: true }),
				],
			},
		]);

		expect(html).toContain("Why &lt;b&gt;this&lt;/b&gt;");
	});
});

describe("renderArticleContent entry and asset hyperlinks", () => {
	it("addresses an Article an editor linked by its slug", () => {
		const html = render([
			{ ...paragraph("x"), content: [entryHyperlink({ contentType: "article", fields: { slug: "a-piece" } })] },
		]);

		expect(html).toContain('<a href="/articles/a-piece">read this</a>');
	});

	it("keeps the label but drops the link when the entry is not an Article", () => {
		const html = render([
			{ ...paragraph("x"), content: [entryHyperlink({ contentType: "author", fields: { slug: "bianca" } })] },
		]);

		expect(html).toContain("read this");
		expect(html).not.toContain("<a href");
	});

	it("absolutises an asset link, since Contentful serves it protocol relative", () => {
		const html = render([{ ...paragraph("x"), content: [assetHyperlink({ url: "//cdn/report.pdf" })] }]);

		expect(html).toContain('href="https://cdn/report.pdf"');
		expect(html).toContain('target="_blank"');
	});

	it("keeps the label but drops the link when the asset carries no file", () => {
		const html = render([{ ...paragraph("x"), content: [assetHyperlink(undefined)] }]);

		expect(html).toContain("the file");
		expect(html).not.toContain("<a href");
	});
});

describe("renderArticleContent video and iframe embeds", () => {
	it("turns a youtube watch url into its embed url, which is what an iframe can load", () => {
		const html = render([
			embed({ contentType: "videoEmbed", fields: { url: "https://www.youtube.com/watch?v=abc123", title: "A talk" } }),
		]);

		expect(html).toContain('src="https://www.youtube.com/embed/abc123"');
	});

	it("turns a youtu.be short url into the same embed url", () => {
		const html = render([
			embed({ contentType: "videoEmbed", fields: { url: "https://youtu.be/abc123", title: "A talk" } }),
		]);

		expect(html).toContain('src="https://www.youtube.com/embed/abc123"');
	});

	it("leaves a url it does not recognise alone rather than mangling it", () => {
		const html = render([
			embed({ contentType: "videoEmbed", fields: { url: "https://vimeo.com/12345", title: "A talk" } }),
		]);

		expect(html).toContain('src="https://vimeo.com/12345"');
	});

	it("leaves an unparseable url alone rather than throwing on it", () => {
		const html = render([embed({ contentType: "videoEmbed", fields: { url: "not a url", title: "A talk" } })]);

		expect(html).toContain('src="not a url"');
	});

	it("escapes the title an editor gave a video", () => {
		const html = render([
			embed({ contentType: "videoEmbed", fields: { url: "https://youtu.be/a", title: 'x" onload="y' } }),
		]);

		expect(html).not.toContain('onload="y"');
		expect(html).toContain("&quot;");
	});

	it("renders nothing for a video the CMS left without a title", () => {
		expect(render([embed({ contentType: "videoEmbed", fields: { url: "https://youtu.be/a" } })])).not.toContain(
			"<iframe",
		);
	});

	it("refuses a javascript: iframe source, leaving the src empty rather than live", () => {
		const html = render([embed({ contentType: "iframeEmbed", fields: { url: "javascript:alert(1)" } })]);

		expect(html).toContain('src=""');
		expect(html).not.toContain("alert(1)");
	});

	it("renders an iframe embed with no title rather than the string undefined", () => {
		const html = render([embed({ contentType: "iframeEmbed", fields: { url: "https://example.com/widget" } })]);

		expect(html).toContain('title=""');
	});
});

describe("renderArticleContent image embeds", () => {
	it("carries the asset's own dimensions onto the img, so the page reserves the space", () => {
		const html = render([
			embed({ contentType: "imageEmbed", fields: { image: { fields: { file: asset({ url: "//cdn/hero.jpg" }) } } } }),
		]);

		expect(html).toContain('width="1200"');
		expect(html).toContain('height="630"');
	});

	it("emits a srcset, so a narrow screen does not download the widest crop", () => {
		const html = render([
			embed({ contentType: "imageEmbed", fields: { image: { fields: { file: asset({ url: "//cdn/hero.jpg" }) } } } }),
		]);

		expect(html).toContain("srcset=");
		expect(html).toContain("400");
	});

	it("takes the alt text from the asset's description, falling back to its title", () => {
		const described = render([
			embed({
				contentType: "imageEmbed",
				fields: { image: { fields: { file: asset({ url: "//cdn/a.jpg" }), description: "A described image" } } },
			}),
		]);
		const titled = render([
			embed({
				contentType: "imageEmbed",
				fields: { image: { fields: { file: asset({ url: "//cdn/a.jpg" }), title: "A titled image" } } },
			}),
		]);

		expect(described).toContain('alt="A described image"');
		expect(titled).toContain('alt="A titled image"');
	});

	it("emits an empty alt for a decorative image the editor described neither way", () => {
		expect(
			render([
				embed({ contentType: "imageEmbed", fields: { image: { fields: { file: asset({ url: "//cdn/a.jpg" }) } } } }),
			]),
		).toContain('alt=""');
	});

	it("renders a caption only when the editor wrote one", () => {
		const captioned = render([
			embed({
				contentType: "imageEmbed",
				fields: { caption: "The caption", image: { fields: { file: asset({ url: "//cdn/a.jpg" }) } } },
			}),
		]);

		expect(captioned).toContain("<figcaption>The caption</figcaption>");
		expect(
			render([
				embed({ contentType: "imageEmbed", fields: { image: { fields: { file: asset({ url: "//cdn/a.jpg" }) } } } }),
			]),
		).not.toContain("<figcaption>");
	});

	it("escapes a caption, since an editor writes it", () => {
		const html = render([
			embed({
				contentType: "imageEmbed",
				fields: { caption: "<script>alert(1)</script>", image: { fields: { file: asset({ url: "//cdn/a.jpg" }) } } },
			}),
		]);

		expect(html).not.toContain("<script>alert");
		expect(html).toContain("&lt;script&gt;");
	});

	it("renders nothing for an image embed whose asset carries no file", () => {
		expect(render([embed({ contentType: "imageEmbed", fields: { image: { fields: {} } } })])).not.toContain("<figure");
	});
});

describe("renderArticleContent code and split blocks", () => {
	it("escapes a code block, so a snippet about html does not become html", () => {
		const html = render([embed({ contentType: "codeBlock", fields: { code: "<div onclick='x'>" } })]);

		expect(html).toContain("<pre><code>&lt;div onclick=&#39;x&#39;&gt;</code></pre>");
	});

	it("renders nothing for a code block with no code", () => {
		expect(render([embed({ contentType: "codeBlock", fields: {} })])).not.toContain("<pre>");
	});

	it("renders a split block's heading and text beside its image", () => {
		const html = render([
			embed({
				contentType: "splitBlock",
				fields: { heading: "A heading", text: "Some text", image: { fields: { file: asset({ url: "//cdn/a.jpg" }) } } },
			}),
		]);

		expect(html).toContain("<h3>A heading</h3>");
		expect(html).toContain("<p>Some text</p>");
		expect(html).toContain('class="split"');
	});

	it("renders nothing at all for an embedded entry of a type it does not know", () => {
		expect(render([embed({ contentType: "somethingElse", fields: { url: "https://example.com" } })]).trim()).toBe("");
	});
});

describe("renderArticleContent tag links and embedded assets", () => {
	const embeddedAsset = (fields: Record<string, unknown>) => ({
		nodeType: "embedded-asset-block",
		data: { target: { fields } },
		content: [],
	});

	it("opens a link to a tag page in a new tab, but gives it no external cue", () => {
		const html = render([{ ...paragraph("x"), content: [hyperlink("https://biancafiore.me/tags/craft")] }]);

		expect(html).toContain('target="_blank"');
		expect(html).not.toContain("external-link-icon");
	});

	it("renders an embedded asset full bleed, with the dimensions the asset carries", () => {
		const html = render([embeddedAsset({ file: asset({ url: "//cdn/hero.jpg" }) })]);

		expect(html).toContain('class="full-bleed"');
		expect(html).toContain('width="1200"');
		expect(html).toContain('height="630"');
	});

	it("falls back to the Article's own title for an asset the editor never described", () => {
		expect(render([embeddedAsset({ file: asset({ url: "//cdn/hero.jpg" }) })])).toContain('alt="An article"');
	});

	it("prefers the asset's description, and repeats it as the caption", () => {
		const html = render([embeddedAsset({ file: asset({ url: "//cdn/hero.jpg" }), description: "The scene" })]);

		expect(html).toContain('alt="The scene"');
		expect(html).toContain("<figcaption>The scene</figcaption>");
	});

	it("renders nothing for an embedded asset with no file behind it", () => {
		expect(render([embeddedAsset({})]).trim()).toBe("");
	});

	it("renders a split block's image half with a srcset", () => {
		const html = render([
			embed({
				contentType: "splitBlock",
				fields: { image: { fields: { file: asset({ url: "//cdn/a.jpg" }), description: "Alt text" } } },
			}),
		]);

		expect(html).toContain('alt="Alt text"');
		expect(html).toContain("srcset=");
	});

	it("renders nothing for a split block with no image", () => {
		expect(render([embed({ contentType: "splitBlock", fields: { heading: "Only a heading" } })]).trim()).toBe("");
	});
});
