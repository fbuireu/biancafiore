import { describe, expect, it } from "vitest";
import { type PortableTextContent, proseOf, readableTextOf } from "./portableText";

const span = (text: string): PortableTextContent[number] => ({ _type: "span", _key: text, text, marks: [] });

interface BlockParams {
	text: string;
	style?: string;
}

const block = ({ text, style = "normal" }: BlockParams): PortableTextContent[number] => ({
	_type: "block",
	_key: text,
	style,
	children: [span(text)],
	markDefs: [],
});

const RAW_BODY = [
	block({ text: "Heading words", style: "h2" }),
	block({ text: "Paragraph words here" }),
	{ _type: "image", _key: "image", asset: { url: "/_emdash/api/media/file/hero.jpg" }, caption: "Caption words" },
	{ _type: "splitBlock", _key: "split", image: "/hero.jpg", heading: "Split heading", text: "Split text" },
	{ _type: "code", _key: "code", code: "codeWord" },
	{ _type: "table", _key: "table", rows: [{ _key: "r", cells: [{ _key: "c", content: [span("Cell words")] }] }] },
	{ _type: "iframe", _key: "iframe", src: "https://example.com", title: "Not prose" },
];

describe("proseOf", () => {
	it("reads the prose a description falls back to from the text blocks alone, headings included", () => {
		expect(proseOf(RAW_BODY)).toBe("Heading words Paragraph words here");
	});

	it("reads no prose from an Article with no body", () => {
		expect(proseOf(undefined)).toBe("");
	});
});

describe("readableTextOf", () => {
	it("reads everything a reader reads for the reading time: text, captions, split blocks, code and tables", () => {
		expect(readableTextOf(RAW_BODY)).toBe(
			"Heading words Paragraph words here Caption words Split heading Split text codeWord Cell words",
		);
	});

	it("reads no text from an Article with no body", () => {
		expect(readableTextOf(undefined)).toBe("");
	});
});
