import { describe, expect, it } from "vitest";
import { imagePlaceholder, MAX_PLACEHOLDER_HEIGHT, PLACEHOLDER_WIDTH } from "./imagePlaceholder";

const BLURHASH = "LXCacDM{RjxuOxogkCR.Dkt7t7Rj";

const bytesOf = (dataUrl: string) => Buffer.from(dataUrl.replace("data:image/bmp;base64,", ""), "base64");

describe("imagePlaceholder", () => {
	it("decodes the blurhash EmDash stored on upload into a bitmap the page inlines, so no request is made for it", () => {
		const placeholder = imagePlaceholder({ blurhash: BLURHASH, width: 1920, height: 1277 });

		expect(placeholder).toMatch(/^data:image\/bmp;base64,/);

		const bytes = bytesOf(placeholder ?? "");

		expect(bytes.subarray(0, 2).toString("latin1")).toBe("BM");
		expect(bytes.readInt32LE(18)).toBe(PLACEHOLDER_WIDTH);
		expect(bytes.readInt32LE(22)).toBe(8);
		expect(bytes.readUInt32LE(2)).toBe(bytes.length);
	});

	it("keeps the image's proportions, within a height a tall portrait cannot blow up", () => {
		const portrait = bytesOf(imagePlaceholder({ blurhash: BLURHASH, width: 100, height: 1000 }) ?? "");

		expect(portrait.readInt32LE(22)).toBe(MAX_PLACEHOLDER_HEIGHT);
	});

	it.each([
		["no blurhash, which EmDash leaves out for formats it cannot decode", undefined],
		["an empty one", ""],
		["one that is not a blurhash", "not-a-hash"],
	])("answers nothing for %s, and the image renders unblurred", (_case, blurhash) => {
		expect(imagePlaceholder({ blurhash, width: 10, height: 10 })).toBeUndefined();
	});

	it("answers nothing for an image without dimensions", () => {
		expect(imagePlaceholder({ blurhash: BLURHASH, width: 0, height: 10 })).toBeUndefined();
	});
});
