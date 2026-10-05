import { describe, expect, it, vi } from "vitest";
import type { RawArticle } from "../types";
import { renderArticleContent } from "./content";

vi.mock("astro:content", async () => {
	const { z } = await import("@shared/utils/zod");

	return { reference: () => z.custom(() => true) };
});

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

		expect(new Set(headings.map(({ id }) => id)).size).toBe(3);
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

const hyperlink = (uri: string) => ({
	nodeType: "hyperlink",
	data: { uri },
	content: [text("a link")],
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

const assetHyperlink = (file: unknown) => ({
	nodeType: "asset-hyperlink",
	data: { target: { fields: { file } } },
	content: [text("the file")],
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

	it("links an embedded Article by its trimmed slug, the id its page is generated from", () => {
		const html = render([
			{
				...paragraph("x"),
				content: [embed({ contentType: "article", fields: { slug: "  a-piece  ", title: "A piece" }, inline: true })],
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

	it("addresses a linked Article by its trimmed slug, the id its page is generated from", () => {
		const html = render([
			{ ...paragraph("x"), content: [entryHyperlink({ contentType: "article", fields: { slug: " a-piece " } })] },
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

	it("keeps an asset link that is already absolute, rather than prefixing the scheme twice", () => {
		const html = render([{ ...paragraph("x"), content: [assetHyperlink({ url: "https://cdn/report.pdf" })] }]);

		expect(html).toContain('href="https://cdn/report.pdf"');
		expect(html).not.toContain("https:https:");
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

	it("wraps a generic iframe in the block the article stylesheet sizes it through, and a video in nothing", () => {
		const generic = render([
			embed({ contentType: "iframeEmbed", fields: { url: "https://example.com/widget", title: "A widget" } }),
		]);
		const video = render([
			embed({ contentType: "videoEmbed", fields: { url: "https://youtu.be/a", title: "A talk" } }),
		]);

		expect(generic).toContain('<div class="iframe-embed"><iframe src="https://example.com/widget"');
		expect(generic).toContain("</iframe></div>");
		expect(video).not.toContain("iframe-embed");
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
		expect(html).toContain(" 400w");
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

	it("renders nothing for an embedded entry of a type it does not know, even one carrying a usable image", () => {
		const image = { fields: { file: asset({ url: "//cdn/a.jpg" }) } };

		expect(render([embed({ contentType: "somethingElse", fields: { image } })]).trim()).toBe("");
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

	it("addresses an embedded asset whose url is already absolute by that url, never by a doubled scheme", () => {
		const html = render([embeddedAsset({ file: asset({ url: "https://cdn/hero.jpg" }) })]);

		expect(html).toContain("/https://cdn/hero.jpg");
		expect(html).not.toContain("https:https:");
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

describe("renderArticleContent image embeds with an incomplete asset", () => {
	const bareAsset = { url: "//cdn/hero.jpg" };

	const imageEmbed = (fields: Record<string, unknown>) =>
		embed({ contentType: "imageEmbed", fields: { image: { fields: { file: bareAsset, ...fields } } } });

	it("renders an asset carrying no dimensions rather than dropping it", () => {
		const html = render([imageEmbed({})]);

		expect(html).toContain("<figure");
		expect(html).toContain('height=""');
		expect(html).toContain('width=""');
	});

	it("asks the CDN for a sensible width when the asset declares none", () => {
		const html = render([imageEmbed({})]);

		expect(html).toContain("width=768");
	});

	it("prefers the description to the title for the alt", () => {
		const html = render([imageEmbed({ description: "A view of the bay", title: "hero" })]);

		expect(html).toContain('alt="A view of the bay"');
	});

	it("escapes an alt that carries markup", () => {
		const html = render([imageEmbed({ description: 'A "quoted" <b>bay</b>' })]);

		expect(html).toContain("&quot;quoted&quot;");
		expect(html).not.toContain("<b>bay</b>");
	});

	it("renders no wrapper class when the embed names no layout", () => {
		expect(render([imageEmbed({})])).toContain("<figure>");
	});
});

describe("renderArticleContent split blocks with an incomplete asset", () => {
	const splitBlock = (fields: Record<string, unknown>) =>
		embed({
			contentType: "splitBlock",
			fields: { heading: "A heading", image: { fields: { file: { url: "//cdn/side.jpg" }, ...fields } } },
		});

	it("renders an asset carrying no dimensions rather than dropping the block", () => {
		const html = render([splitBlock({})]);

		expect(html).toContain('height=""');
		expect(html).toContain('width=""');
		expect(html).toContain("width=768");
	});

	it("prefers the description to the title for the alt, and falls back to neither", () => {
		expect(render([splitBlock({ description: "Beside the text" })])).toContain('alt="Beside the text"');
		expect(render([splitBlock({ title: "side" })])).toContain('alt="side"');
		expect(render([splitBlock({})])).toContain('alt=""');
	});
});

describe("renderArticleContent nodes whose data is not the shape Contentful promised", () => {
	const unresolvedEntry = { sys: { type: "Link", linkType: "Entry", id: "3kLmNoP" } };
	const unresolvedAsset = { sys: { type: "Link", linkType: "Asset", id: "8qRsTuV" } };

	it("keeps a hyperlink's label but links nowhere when the node carries no uri", () => {
		const html = render([
			{ ...paragraph("x"), content: [{ nodeType: "hyperlink", data: {}, content: [text("label")] }] },
		]);

		expect(html).toContain("label");
		expect(html).not.toContain("<a href");
	});

	it("renders nothing for an embedded entry Contentful left as an unresolved link, rather than failing the build", () => {
		const inline = { nodeType: "embedded-entry-inline", data: { target: unresolvedEntry }, content: [] };
		const block = { nodeType: "embedded-entry-block", data: { target: unresolvedEntry }, content: [] };

		expect(render([{ ...paragraph("x"), content: [inline] }, block])).not.toContain("<a href");
		expect(render([block]).trim()).toBe("");
	});

	it("keeps the label of an entry hyperlink whose target was left unresolved", () => {
		const link = { nodeType: "entry-hyperlink", data: { target: unresolvedEntry }, content: [text("read this")] };
		const html = render([{ ...paragraph("x"), content: [link] }]);

		expect(html).toContain("read this");
		expect(html).not.toContain("<a href");
	});

	it("keeps the label of an asset hyperlink, and renders no embedded asset, whose target was left unresolved", () => {
		const link = { nodeType: "asset-hyperlink", data: { target: unresolvedAsset }, content: [text("the file")] };
		const block = { nodeType: "embedded-asset-block", data: { target: unresolvedAsset }, content: [] };

		expect(render([{ ...paragraph("x"), content: [link] }])).not.toContain("<a href");
		expect(render([block]).trim()).toBe("");
	});

	it("renders no wrapper class for a layout it does not know, even one every object inherits", () => {
		const html = render([
			embed({
				contentType: "imageEmbed",
				fields: { layout: "toString", image: { fields: { file: asset({ url: "//cdn/a.jpg" }) } } },
			}),
		]);

		expect(html).toContain("<figure>");
		expect(html).not.toContain("function");
	});

	it("wraps an image in the class its known layout names", () => {
		const html = render([
			embed({
				contentType: "imageEmbed",
				fields: { layout: "breakout", image: { fields: { file: asset({ url: "//cdn/a.jpg" }) } } },
			}),
		]);

		expect(html).toContain('<figure class="breakout">');
	});

	it("renders nothing for an image whose dimensions are not numbers, rather than writing them into the markup", () => {
		const file = { url: "//cdn/a.jpg", details: { image: { width: '1" onerror="alert(1)', height: 630 } } };

		expect(render([embed({ contentType: "imageEmbed", fields: { image: { fields: { file } } } })])).not.toContain(
			"onerror",
		);
		expect(
			render([{ nodeType: "embedded-asset-block", data: { target: { fields: { file } } }, content: [] }]),
		).not.toContain("onerror");
	});
});
