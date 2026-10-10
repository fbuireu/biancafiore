import { IMAGE_CDN } from "@const/index";
import { MEDIA_FILE_PATH } from "@infrastructure/cms/media";
import { BLURHASH, rawEntry } from "@tests/doubles/cmsEntries";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PortableTextContent } from "../../shared/portableText";
import type { ArticleFields } from "../types";
import { prepareArticleContent } from "./content";

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

const linked = (href: unknown) =>
	block({
		children: [span({ text: "a link", marks: ["link-1"] })],
		markDefs: [{ _type: "link", _key: "link-1", href }],
	});

interface TypedParams extends Record<string, unknown> {
	_type: string;
}

const typed = (fields: TypedParams) => ({ _key: nextKey(), ...fields });

const makeArticle = (content: unknown[]) =>
	rawEntry<ArticleFields>({
		slug: "an-article",
		data: { title: "An article", content: content as PortableTextContent, publish_date: "2024-01-01" },
	});

const prepare = (content: unknown[]) => prepareArticleContent(makeArticle(content));

const prepared = (content: unknown[]) => prepare(content).content;

const markDefOf = (href: unknown) => {
	const [{ markDefs }] = prepared([linked(href)]) as unknown as [{ markDefs: Record<string, unknown>[] }];

	return markDefs[0];
};

describe("prepareArticleContent headings", () => {
	it("collects a heading's level, anchor id, authored text and the scope it stamps on the heading", () => {
		const { content, headings } = prepare([heading({ level: 3, value: "Tips & Tricks" })]);

		expect(headings).toEqual([{ level: 3, id: "tips-tricks", text: "Tips & Tricks", scope: "--section-1" }]);
		expect(content[0]).toMatchObject({
			_type: "articleHeading",
			tag: "h3",
			anchor: "tips-tricks",
			text: "Tips & Tricks",
			scope: "--section-1",
		});
	});

	it("collects the headings in document order, whatever order their levels come in", () => {
		const { headings } = prepare([
			heading({ level: 4, value: "Deep" }),
			paragraph("Body"),
			heading({ level: 2, value: "Top" }),
		]);

		expect(headings.map(({ text }) => text)).toEqual(["Deep", "Top"]);
	});

	it("anchors an h1 but collects nothing for it, so the page title stays out of the Table of Contents", () => {
		const { content, headings } = prepare([heading({ level: 1, value: "Title" })]);

		expect(headings).toEqual([]);
		expect(content[0]).toMatchObject({ _type: "articleHeading", tag: "h1", anchor: "title", text: "Title" });
		expect(content[0]).not.toHaveProperty("scope");
	});

	it("numbers a section with the place its heading takes in the collected list", () => {
		const { headings } = prepare([
			heading({ level: 2, value: "One" }),
			heading({ level: 1, value: "Skipped" }),
			heading({ level: 3, value: "Two" }),
		]);

		expect(headings.map(({ scope }) => scope)).toEqual(["--section-1", "--section-2"]);
	});

	it("reads a heading's text across every span, whatever marks the editor put on them", () => {
		const { headings } = prepare([
			block({ style: "h2", children: [span({ text: "Bold " }), span({ text: "move", marks: ["strong"] })] }),
		]);

		expect(headings.map(({ text }) => text)).toEqual(["Bold move"]);
	});

	it("gives a heading that repeats an earlier one its own anchor, so the table of contents jumps to each", () => {
		const { headings } = prepare([
			heading({ level: 2, value: "Conclusion" }),
			heading({ level: 2, value: "Conclusion" }),
		]);

		expect(headings.map(({ id }) => id)).toEqual(["conclusion", "conclusion-2"]);
	});

	it("counts the h1 among the anchors too, since every heading id lives in the one document", () => {
		const { headings } = prepare([heading({ level: 1, value: "Intro" }), heading({ level: 2, value: "Intro" })]);

		expect(headings.map(({ id }) => id)).toEqual(["intro-2"]);
	});

	it("never hands a heading an anchor an earlier heading already spells", () => {
		const { headings } = prepare([
			heading({ level: 2, value: "Step" }),
			heading({ level: 2, value: "Step 2" }),
			heading({ level: 2, value: "Step" }),
		]);

		expect(new Set(headings.map(({ id }) => id)).size).toBe(3);
	});

	it("numbers the headings that fall back to a section anchor, so each stays addressable", () => {
		const { headings } = prepare([heading({ level: 2, value: "!!!" }), heading({ level: 2, value: "日本語" })]);

		expect(headings.map(({ id }) => id)).toEqual(["section", "section-2"]);
	});

	it("answers with an empty heading list for a body that has none", () => {
		expect(prepare([paragraph("Body")]).headings).toEqual([]);
	});

	it("starts a fresh heading list per article rather than accumulating across calls", () => {
		prepare([heading({ level: 2, value: "First" })]);

		expect(prepare([heading({ level: 2, value: "First" })]).headings.map(({ id }) => id)).toEqual(["first"]);
	});
});

describe("prepareArticleContent links", () => {
	it("opens a link to somewhere else in a new tab, which the stylesheet marks as external", () => {
		expect(markDefOf("https://example.com/a")).toMatchObject({ href: "https://example.com/a", blank: true });
	});

	it("keeps a link to our own page in the same tab, as a path, so a preview stays on its own origin", () => {
		expect(markDefOf("https://biancafiore.me/articles/x?y=1#z")).toMatchObject({
			href: "/articles/x?y=1#z",
			blank: false,
		});
	});

	it("treats a relative link and an in-page anchor as our own and leaves them as written", () => {
		expect(markDefOf("/about")).toMatchObject({ href: "/about", blank: false });
		expect(markDefOf("#later")).toMatchObject({ href: "#later", blank: false });
	});

	it("opens a link to a tag page in a new tab, as a path, so it gets no external cue", () => {
		expect(markDefOf("https://biancafiore.me/tags/travel")).toMatchObject({ href: "/tags/travel", blank: true });
	});

	it("keeps a mail link as written, in the same tab", () => {
		expect(markDefOf("mailto:hi@example.com")).toMatchObject({ href: "mailto:hi@example.com" });
		expect(markDefOf("mailto:hi@example.com")).not.toHaveProperty("blank");
	});

	it.each([
		["a javascript: address", "javascript:alert(1)"],
		["no href at all", undefined],
		["an address no URL can be made of", "http://"],
	])("keeps the label but drops the link for %s", (_case, href) => {
		const [{ markDefs, children }] = prepared([linked(href)]) as unknown as [
			{ markDefs: unknown[]; children: { text: string; marks: string[] }[] },
		];

		expect(markDefs).toEqual([]);
		expect(children).toEqual([expect.objectContaining({ text: "a link", marks: [] })]);
	});

	it("prepares a table cell's links against the table's own definitions, and drops a dead one from its spans", () => {
		const [table] = prepared([
			typed({
				_type: "table",
				markDefs: [
					{ _type: "link", _key: "shared", href: "https://example.com" },
					{ _type: "link", _key: "dead", href: "javascript:x" },
				],
				rows: [
					{
						_key: "r",
						cells: [
							{
								_key: "c",
								content: [span({ text: "x", marks: ["shared", "dead"] })],
								markDefs: [{ _type: "link", _key: "own", href: "/about" }],
							},
						],
					},
				],
			}),
		]) as unknown as [
			{
				markDefs: Record<string, unknown>[];
				rows: [{ cells: [{ content: { marks: string[] }[]; markDefs: Record<string, unknown>[] }] }];
			},
		];

		expect(table.markDefs).toEqual([expect.objectContaining({ _key: "shared", blank: true })]);
		expect(table.rows[0].cells[0].content[0].marks).toEqual(["shared"]);
		expect(table.rows[0].cells[0].markDefs).toEqual([expect.objectContaining({ _key: "own", href: "/about" })]);
	});
});

interface PreparedImageBlock {
	src: string;
	srcset: string;
	alt: string;
	width?: number;
	height?: number;
	placeholder?: string;
	caption?: string;
	layout?: string;
}

describe("prepareArticleContent images", () => {
	const image = (fields: Record<string, unknown> = {}) =>
		typed({ _type: "image", asset: { _ref: "01MEDIA", url: IMAGE_URL }, width: 1200, height: 630, ...fields });

	const preparedImage = (fields: Record<string, unknown> = {}) =>
		prepared([image(fields)])[0] as unknown as PreparedImageBlock;

	it("carries the media's own dimensions, so the page reserves the space", () => {
		expect(preparedImage()).toMatchObject({ width: 1200, height: 630 });
	});

	it("builds a srcset, so a narrow screen does not download the widest crop", () => {
		vi.stubEnv("IMAGE_CDN", IMAGE_CDN.CLOUDFLARE);

		expect(preparedImage().srcset).toContain(" 400w");
	});

	it("takes the alt text the editor wrote, and falls back to the Article's own title", () => {
		expect(preparedImage({ alt: "A described image" }).alt).toBe("A described image");
		expect(preparedImage().alt).toBe("An article");
	});

	it("carries a caption only when the editor wrote one", () => {
		expect(preparedImage({ caption: "The caption" }).caption).toBe("The caption");
		expect(preparedImage()).not.toHaveProperty("caption");
	});

	it("decodes the blurhash EmDash stores on the block into a placeholder", () => {
		expect(preparedImage({ blurhash: BLURHASH }).placeholder).toMatch(/^data:image\/bmp;base64,/);
	});

	it("reads a blurhash an older block kept in its asset's meta", () => {
		const fields = { asset: { _ref: "01MEDIA", url: IMAGE_URL, meta: { blurhash: BLURHASH } } };

		expect(preparedImage(fields).placeholder).toMatch(/^data:image\/bmp;base64,/);
	});

	it.each([
		["no blurhash", {}],
		["no dimensions to shape the placeholder", { blurhash: BLURHASH, width: undefined, height: undefined }],
	])("carries no placeholder with %s", (_case, fields) => {
		expect(preparedImage(fields)).not.toHaveProperty("placeholder");
	});

	it("names the layout its alignment asks for, and none for one the site does not lay out", () => {
		expect(preparedImage({ alignment: "full" }).layout).toBe("full-bleed");
		expect(preparedImage({ alignment: "wide" }).layout).toBe("breakout");
		expect(preparedImage({ alignment: "center" })).not.toHaveProperty("layout");
		expect(preparedImage({ alignment: "toString" })).not.toHaveProperty("layout");
	});

	it("keeps media carrying no dimensions, asking the CDN for a sensible width", () => {
		vi.stubEnv("IMAGE_CDN", IMAGE_CDN.CLOUDFLARE);

		const prepared = preparedImage({ width: undefined, height: undefined });

		expect(prepared).not.toHaveProperty("width");
		expect(prepared.src).toContain("width=768");
	});

	it("drops an image whose dimensions are not numbers, rather than handing them to the markup", () => {
		expect(prepared([image({ width: '1" onerror="alert(1)' })])).toEqual([]);
	});

	it("serves an image hosted elsewhere from its absolute url, untransformed", () => {
		expect(preparedImage({ asset: { _ref: "01MEDIA", url: "https://images.example.com/a.jpg" } }).src).toBe(
			"https://images.example.com/a.jpg",
		);
	});

	it("drops an image whose source is neither a url nor a path on this origin", () => {
		expect(prepared([typed({ _type: "image", asset: { _ref: "01MEDIA", url: "a.jpg" } })])).toEqual([]);
		expect(
			prepared([typed({ _type: "image", asset: { _ref: "01MEDIA", url: "//images.example.com/a.jpg" } })]),
		).toEqual([]);
		expect(prepared([typed({ _type: "image", asset: { _ref: "01MEDIA" } })])).toEqual([]);
	});
});

describe("prepareArticleContent split blocks", () => {
	const split = (fields: Record<string, unknown> = {}) =>
		typed({ _type: "splitBlock", image: IMAGE_URL, heading: "Heading", text: "Text", ...fields });

	it("carries a split block's heading and text with its image prepared, and the alt the editor wrote", () => {
		expect(prepared([split({ alt: "Described" })])[0]).toMatchObject({
			_type: "splitBlock",
			heading: "Heading",
			text: "Text",
			alt: "Described",
			src: expect.stringContaining("hero.jpg"),
		});
	});

	it("gives a split block's image an empty alt when the editor never described it", () => {
		expect(prepared([split()])[0]).toMatchObject({ alt: "" });
	});

	it("drops a split block with no image", () => {
		expect(prepared([split({ image: undefined })])).toEqual([]);
	});
});

describe("prepareArticleContent native blocks", () => {
	it("hands the blocks EmDash renders itself to the page as written, once their fields hold", () => {
		const blocks = [
			typed({ _type: "code", code: "<div>" }),
			typed({ _type: "iframe", src: "https://example.com/widget", title: "Widget" }),
			typed({ _type: "break", style: "line" }),
			typed({ _type: "embed", url: "https://vimeo.com/1" }),
			typed({ _type: "gallery", images: [] }),
		];

		expect(prepared(blocks)).toEqual(blocks);
	});

	it("drops a block no component renders, so nothing reaches the page as a hidden warning", () => {
		expect(prepared([typed({ _type: "somethingElse" }), paragraph("Kept")])).toEqual([
			expect.objectContaining({ _type: "block" }),
		]);
	});

	it.each([
		["a code block with no code", { _type: "code", code: "" }],
		["an iframe served over http", { _type: "iframe", src: "http://example.com" }],
		["an iframe with no source", { _type: "iframe" }],
		["an embed with no address", { _type: "embed" }],
	])("drops %s", (_case, fields) => {
		expect(prepared([typed(fields)])).toEqual([]);
	});

	it("turns an iframe holding a YouTube watch link into the player, the shape EmDash's editor writes", () => {
		const [iframe] = prepared([
			typed({ _type: "iframe", src: "https://www.youtube.com/watch?v=abcdefghijk", title: "A talk" }),
		]);

		expect(iframe).toMatchObject({
			src: "https://www.youtube.com/embed/abcdefghijk",
			width: 560,
			height: 315,
			allowFullscreen: true,
			title: "A talk",
		});
	});

	it("turns a video block an earlier import wrote into the player iframe, and drops one no player answers", () => {
		const [iframe] = prepared([typed({ _type: "videoEmbed", url: "https://youtu.be/abcdefghijk", title: "A talk" })]);

		expect(iframe).toMatchObject({
			_type: "iframe",
			src: "https://www.youtube.com/embed/abcdefghijk",
			title: "A talk",
		});
		expect(prepared([typed({ _type: "videoEmbed", url: "https://example.com/v" })])).toEqual([]);
	});
});

describe("prepareArticleContent text", () => {
	const fixture = () => [
		heading({ level: 2, value: "Heading words" }),
		paragraph("Paragraph words here"),
		typed({ _type: "image", asset: { _ref: "m", url: IMAGE_URL }, caption: "Caption words" }),
		typed({ _type: "splitBlock", image: IMAGE_URL, heading: "Split heading", text: "Split text" }),
		typed({ _type: "code", code: "codeWord" }),
		typed({ _type: "table", rows: [{ _key: "r", cells: [{ _key: "c", content: [span({ text: "Cell words" })] }] }] }),
		typed({ _type: "iframe", src: "https://example.com", title: "Not prose" }),
	];

	it("reads the prose a description falls back to from the text blocks alone", () => {
		expect(prepare(fixture()).prose).toBe("Heading words Paragraph words here");
	});

	it("reads everything a reader reads for the reading time: text, captions, split blocks, code and tables", () => {
		expect(prepare(fixture()).readableText).toBe(
			"Heading words Paragraph words here Caption words Split heading Split text codeWord Cell words",
		);
	});
});

describe("prepareArticleContent raw HTML", () => {
	it("drops a raw HTML block, so an editor's markup never reaches the page unsanitised", () => {
		expect(
			prepared([typed({ _type: "htmlBlock", html: "<img src=x onerror=alert(1)>" }), paragraph("kept")]),
		).toHaveLength(1);
	});
});
