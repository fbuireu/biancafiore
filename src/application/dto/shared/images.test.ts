import { imageSchema } from "@domain/shared/image";
import type { Asset } from "contentful";
import { describe, expect, it } from "vitest";
import { absoluteAssetUrl, createImage } from "./images";

interface AssetParams {
	url?: string;
	contentType?: string;
	width?: number;
	height?: number;
}

const asset = ({
	url = "//images.ctfassets.net/space/asset/hero.jpg",
	contentType = "image/jpeg",
	width = 1200,
	height = 630,
}: AssetParams = {}) =>
	({
		fields: { file: { url, contentType, details: { size: 1024, image: { width, height } } } },
	}) as unknown as Asset<undefined>;

describe("absoluteAssetUrl", () => {
	it("gives Contentful's protocol-relative url the https scheme", () => {
		expect(absoluteAssetUrl("//images.ctfassets.net/space/asset/hero.jpg")).toBe(
			"https://images.ctfassets.net/space/asset/hero.jpg",
		);
	});

	it.each(["https://images.ctfassets.net/space/asset/hero.jpg", "http://cdn/hero.jpg", "/_astro/hero.jpg"])(
		"leaves %s as it is, so a url that is already whole is never prefixed twice",
		(url) => {
			expect(absoluteAssetUrl(url)).toBe(url);
		},
	);
});

describe("createImage", () => {
	it("turns Contentful's protocol-relative asset url into an absolute https one", () => {
		expect(createImage(asset()).url).toBe("https://images.ctfassets.net/space/asset/hero.jpg");
	});

	it("leaves an already absolute url untouched", () => {
		expect(createImage(asset({ url: "https://images.ctfassets.net/space/asset/hero.jpg" })).url).toBe(
			"https://images.ctfassets.net/space/asset/hero.jpg",
		);
	});

	it("emits a url the domain schema accepts as a url", () => {
		expect(() => imageSchema.parse(createImage(asset()))).not.toThrow();
	});

	it("carries the pixel dimensions across from the asset details", () => {
		expect(createImage(asset({ width: 640, height: 480 })).details).toStrictEqual({ width: 640, height: 480 });
	});

	it("refuses an asset that carries no pixel dimensions, naming it, since no image renders without them", () => {
		const withoutDimensions = {
			sys: { id: "8yZaBcD" },
			fields: { file: { url: "//cdn/drawing.svg", contentType: "image/svg+xml", details: { size: 2048 } } },
		} as unknown as Asset<undefined>;

		expect(() => createImage(withoutDimensions)).toThrow("(8yZaBcD)");
	});

	it("flags the modern formats off the content type and nothing else", () => {
		expect(createImage(asset({ contentType: "image/avif" })).formats).toStrictEqual({ avif: true, webp: false });
		expect(createImage(asset({ contentType: "image/webp" })).formats).toStrictEqual({ avif: false, webp: true });
		expect(createImage(asset({ contentType: "image/png" })).formats).toStrictEqual({ avif: false, webp: false });
	});

	it("carries the share crops a structured-data payload needs, cut from the absolutised url", () => {
		expect(createImage(asset({ url: "//cdn/hero.jpg" })).shareCrops).toStrictEqual([
			"https://cdn/hero.jpg?w=1200&h=675&fit=fill",
			"https://cdn/hero.jpg?w=1200&h=900&fit=fill",
			"https://cdn/hero.jpg?w=1200&h=1200&fit=fill",
		]);
	});

	it("refuses an asset link Contentful left unresolved, naming it rather than failing on the missing fields", () => {
		const unresolved = { sys: { type: "Link", linkType: "Asset", id: "4aBcDeF" } } as unknown as Asset<undefined>;

		expect(() => createImage(unresolved)).toThrow(
			"An image asset reached the mapper unresolved, without a file or without its pixel dimensions (4aBcDeF), so nothing can render it",
		);
	});

	it("refuses an asset that carries no file, naming it", () => {
		const withoutFile = { sys: { id: "5gHiJkL" }, fields: { title: "An empty asset" } } as unknown as Asset<undefined>;

		expect(() => createImage(withoutFile)).toThrow("(5gHiJkL)");
	});

	it("refuses an asset whose file url is not a string, rather than failing inside the url handling", () => {
		const numericUrl = {
			sys: { id: "6mNoPqR" },
			fields: { file: { url: 42, contentType: "image/jpeg", details: {} } },
		} as unknown as Asset<undefined>;

		expect(() => createImage(numericUrl)).toThrow("(6mNoPqR)");
	});

	it("refuses an asset whose dimensions are not numbers, rather than passing them on as if they were", () => {
		const textualDimensions = {
			sys: { id: "7sTuVwX" },
			fields: {
				file: { url: "//cdn/a.jpg", contentType: "image/jpeg", details: { image: { width: "1200", height: "630" } } },
			},
		} as unknown as Asset<undefined>;

		expect(() => createImage(textualDimensions)).toThrow("(7sTuVwX)");
	});
});
