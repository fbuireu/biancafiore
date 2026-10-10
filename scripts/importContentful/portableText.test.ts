import { describe, expect, it } from "vitest";
import type { ContentfulAsset, ContentfulEntry } from "./contentful.ts";
import {
	assetIdsIn,
	type ConversionContext,
	type PortableTextBlock,
	type RichTextNode,
	richTextToPortableText,
	type UploadedMedia,
} from "./portableText.ts";

const link = (id: string, linkType: "Entry" | "Asset" = "Entry") => ({ sys: { type: "Link", linkType, id } });

const entry = (id: string, contentType: string, fields: Record<string, unknown>): ContentfulEntry => ({
	sys: { id, createdAt: "", updatedAt: "", contentType: { sys: { id: contentType } } },
	fields,
});

const asset = (id: string, fields: ContentfulAsset["fields"] = {}): ContentfulAsset => ({ sys: { id }, fields });

const MEDIA: UploadedMedia = {
	id: "01MEDIA",
	url: "/_emdash/api/media/file/hero.jpg",
	storageKey: "hero.jpg",
	filename: "hero.jpg",
	mimeType: "image/jpeg",
	width: 1200,
	height: 630,
};

const text = (value: string, marks: string[] = []): RichTextNode => ({
	nodeType: "text",
	value,
	marks: marks.map((type) => ({ type })),
});

const node = (nodeType: string, content: RichTextNode[] = [], data: Record<string, unknown> = {}): RichTextNode => ({
	nodeType,
	content,
	data,
});

const doc = (...content: RichTextNode[]) => ({ nodeType: "document", content });

const contextWith = (overrides: Partial<ConversionContext> = {}): ConversionContext => {
	let key = 0;

	return {
		entries: new Map(),
		assets: new Map([["asset-1", asset("asset-1", { description: "A described image" })]]),
		media: new Map([["asset-1", MEDIA]]),
		title: "An article",
		warnings: [],
		nextKey: () => `k${key++}`,
		...overrides,
	};
};

const convert = (document: unknown, context = contextWith()) => richTextToPortableText({ document, context });

const textOfBlock = (block: PortableTextBlock): string =>
	((block.children ?? []) as Array<{ text: string }>).map(({ text: value }) => value).join("");

describe("richTextToPortableText text blocks", () => {
	it("turns paragraphs and headings into blocks of the matching style", () => {
		expect(convert(doc(node("paragraph", [text("Body")]), node("heading-2", [text("Title")])))).toEqual([
			{
				_type: "block",
				_key: "k1",
				style: "normal",
				children: [expect.objectContaining({ text: "Body" })],
				markDefs: [],
			},
			{ _type: "block", _key: "k3", style: "h2", children: [expect.objectContaining({ text: "Title" })], markDefs: [] },
		]);
	});

	it("drops an empty paragraph, which the editor would drop on the first save anyway", () => {
		expect(convert(doc(node("paragraph", [text("")])))).toEqual([]);
	});

	it("translates every mark to the name the editor writes", () => {
		const [block] = convert(
			doc(
				node(
					"paragraph",
					["bold", "italic", "underline", "code", "superscript", "subscript", "strikethrough"].map((mark) =>
						text(mark, [mark]),
					),
				),
			),
		);

		expect((block.children as Array<{ marks: string[] }>).map(({ marks }) => marks)).toEqual([
			["strong"],
			["em"],
			["underline"],
			["code"],
			["superscript"],
			["subscript"],
			["strike-through"],
		]);
	});

	it("keeps a quote of several paragraphs one quote, its paragraphs split by a line break", () => {
		const blocks = convert(
			doc(node("blockquote", [node("paragraph", [text("One")]), node("paragraph", [text("Two")])])),
		);

		expect(blocks.map(({ style }) => style)).toEqual(["blockquote"]);
		expect(blocks.map(textOfBlock)).toEqual(["One\nTwo"]);
	});

	it("keeps a list item of several paragraphs one item, rather than a bullet per paragraph", () => {
		const list = node("unordered-list", [
			node("list-item", [node("paragraph", [text("First")]), node("paragraph", [text("Second")])]),
		]);

		expect(convert(doc(list)).map(textOfBlock)).toEqual(["First\nSecond"]);
	});

	it("flattens nested lists into list items with their depth", () => {
		const list = node("unordered-list", [
			node("list-item", [
				node("paragraph", [text("Outer")]),
				node("ordered-list", [node("list-item", [node("paragraph", [text("Inner")])])]),
			]),
		]);

		expect(convert(doc(list)).map(({ listItem, level }) => ({ listItem, level }))).toEqual([
			{ listItem: "bullet", level: 1 },
			{ listItem: "number", level: 2 },
		]);
	});

	it("turns a rule into a break", () => {
		expect(convert(doc(node("hr")))).toEqual([{ _type: "break", _key: "k0", style: "line" }]);
	});

	it("keeps a cell's paragraphs apart with a line break, rather than running their words together", () => {
		const table = node("table", [
			node("table-row", [node("table-cell", [node("paragraph", [text("One")]), node("paragraph", [text("Two")])])]),
		]);
		const [block] = convert(doc(table)) as unknown as [{ rows: [{ cells: [{ content: { text: string }[] }] }] }];

		expect(block.rows[0].cells[0].content.map(({ text: value }) => value).join("")).toBe("One\nTwo");
	});

	it("turns a table into rows of cells, header cells flagged", () => {
		const table = node("table", [
			node("table-row", [node("table-header-cell", [node("paragraph", [text("Head")])])]),
			node("table-row", [node("table-cell", [node("paragraph", [text("Cell")])])]),
		]);
		const [block] = convert(doc(table));
		const rows = block.rows as Array<{ cells: Array<{ isHeader?: boolean; content: Array<{ text: string }> }> }>;

		expect(rows.map(({ cells }) => cells.map(({ isHeader, content }) => [isHeader, content[0].text]))).toEqual([
			[[true, "Head"]],
			[[undefined, "Cell"]],
		]);
	});
});

describe("richTextToPortableText links", () => {
	it("keeps a hyperlink as a link mark over its label", () => {
		const [block] = convert(
			doc(node("paragraph", [node("hyperlink", [text("label")], { uri: "https://example.com" })])),
		);

		expect(block.markDefs).toEqual([{ _type: "link", _key: "k0", href: "https://example.com" }]);
		expect(block.children).toEqual([expect.objectContaining({ text: "label", marks: ["k0"] })]);
	});

	it("links an Article by its route, whether it was hyperlinked or embedded inline", () => {
		const article = entry("a-1", "article", { slug: " a-piece ", title: "A piece" });
		const context = contextWith({ entries: new Map([["a-1", article]]) });
		const [linked] = convert(
			doc(node("paragraph", [node("entry-hyperlink", [text("read")], { target: link("a-1") })])),
			context,
		);
		const [embedded] = convert(
			doc(node("paragraph", [node("embedded-entry-inline", [], { target: link("a-1") })])),
			context,
		);

		expect(linked.markDefs).toEqual([expect.objectContaining({ href: "/articles/a-piece" })]);
		expect(embedded.children).toEqual([expect.objectContaining({ text: "A piece" })]);
	});

	it("keeps the label of a link to something that is not a published Article, and says so", () => {
		const context = contextWith();
		const [block] = convert(
			doc(node("paragraph", [node("entry-hyperlink", [text("read")], { target: link("missing") })])),
			context,
		);

		expect(block.markDefs).toEqual([]);
		expect(block.children).toEqual([expect.objectContaining({ text: "read" })]);
		expect(context.warnings).toHaveLength(1);
	});

	it("links an asset to the file it was uploaded as", () => {
		const [block] = convert(
			doc(node("paragraph", [node("asset-hyperlink", [text("file")], { target: link("asset-1", "Asset") })])),
		);

		expect(block.markDefs).toEqual([expect.objectContaining({ href: MEDIA.url })]);
	});
});

describe("richTextToPortableText embedded entries", () => {
	const embed = (contentType: string, fields: Record<string, unknown>) => {
		const context = contextWith({ entries: new Map([["e-1", entry("e-1", contentType, fields)]]) });

		return { blocks: convert(doc(node("embedded-entry-block", [], { target: link("e-1") })), context), context };
	};

	it("maps each embedded content type onto the block the editor and the site know", () => {
		expect(embed("codeBlock", { code: "<div>" }).blocks).toEqual([{ _type: "code", _key: "k0", code: "<div>" }]);
		expect(embed("videoEmbed", { url: "https://youtu.be/abcdefghijk", title: "A talk" }).blocks).toEqual([
			{
				_type: "iframe",
				_key: "k0",
				src: "https://www.youtube.com/embed/abcdefghijk",
				width: 560,
				height: 315,
				allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
				allowFullscreen: true,
				title: "A talk",
			},
		]);
		expect(embed("iframeEmbed", { url: "https://example.com", title: "Widget" }).blocks).toEqual([
			{ _type: "iframe", _key: "k0", src: "https://example.com", title: "Widget" },
		]);
	});

	it("turns an image embed into an image block, its layout into an alignment and its caption across", () => {
		const [image] = embed("imageEmbed", {
			image: link("asset-1", "Asset"),
			layout: "breakout",
			caption: "Caption",
		}).blocks;

		expect(image).toEqual({
			_type: "image",
			_key: "k1",
			asset: { _ref: MEDIA.id, url: MEDIA.url },
			alt: "A described image",
			caption: "Caption",
			width: 1200,
			height: 630,
			alignment: "wide",
		});
	});

	it("carries the upload's blurhash and dominant colour onto the image block, where the admin's editor keeps them", () => {
		const context = contextWith({
			media: new Map([["asset-1", { ...MEDIA, blurhash: "LKO2?U%2Tw=w", dominantColor: "rgb(1,2,3)" }]]),
		});
		const [image] = convert(doc(node("embedded-asset-block", [], { target: link("asset-1", "Asset") })), context);

		expect(image).toMatchObject({ blurhash: "LKO2?U%2Tw=w", dominantColor: "rgb(1,2,3)" });
	});

	it("turns a split block into the plugin block, pointing at the uploaded image", () => {
		expect(embed("splitBlock", { heading: "H", text: "T", image: link("asset-1", "Asset") }).blocks).toEqual([
			{ _type: "splitBlock", _key: "k0", heading: "H", text: "T", image: MEDIA.url, alt: "A described image" },
		]);
	});

	it("drops an embedded type it has no block for, and says so", () => {
		const { blocks, context } = embed("somethingElse", {});

		expect(blocks).toEqual([]);
		expect(context.warnings).toEqual([expect.stringContaining("somethingElse")]);
	});

	it("renders an embedded asset full width, described by the asset or else by the Article's title", () => {
		const context = contextWith({ assets: new Map([["asset-1", asset("asset-1")]]) });
		const [image] = convert(doc(node("embedded-asset-block", [], { target: link("asset-1", "Asset") })), context);

		expect(image).toMatchObject({ _type: "image", alignment: "full", alt: "An article" });
	});
});

describe("assetIdsIn", () => {
	it("collects the assets a document embeds, links to, or reaches through an embedded entry", () => {
		const entries = new Map([["e-1", entry("e-1", "imageEmbed", { image: link("asset-3", "Asset") })]]);
		const document = doc(
			node("embedded-asset-block", [], { target: link("asset-1", "Asset") }),
			node("paragraph", [node("asset-hyperlink", [text("x")], { target: link("asset-2", "Asset") })]),
			node("embedded-entry-block", [], { target: link("e-1") }),
		);

		expect(assetIdsIn({ document, entries })).toEqual(["asset-1", "asset-2", "asset-3"]);
	});
});

describe("richTextToPortableText video embeds", () => {
	it("drops a video whose address no player answers, and says so", () => {
		const context = contextWith({
			entries: new Map([["e-1", entry("e-1", "videoEmbed", { url: "https://example.com/v", title: "A talk" })]]),
		});

		expect(convert(doc(node("embedded-entry-block", [], { target: link("e-1") })), context)).toEqual([]);
		expect(context.warnings).toEqual([expect.stringContaining("not a YouTube or Vimeo link")]);
	});
});
