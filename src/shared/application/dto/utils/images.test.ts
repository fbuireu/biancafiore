import { imageSchema } from "@domain/shared/image";
import { createImage } from "@shared/application/dto/utils/images";
import type { Asset } from "contentful";
import { describe, expect, it } from "vitest";

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

	it("reports undefined dimensions when the asset carries no image details, rather than throwing", () => {
		const withoutDetails = {
			fields: { file: { url: "//cdn/file.pdf", contentType: "application/pdf", details: {} } },
		} as unknown as Asset<undefined>;

		expect(createImage(withoutDetails).details).toStrictEqual({ width: undefined, height: undefined });
	});

	it("flags the modern formats off the content type and nothing else", () => {
		expect(createImage(asset({ contentType: "image/avif" })).formats).toStrictEqual({ avif: true, webp: false });
		expect(createImage(asset({ contentType: "image/webp" })).formats).toStrictEqual({ avif: false, webp: true });
		expect(createImage(asset({ contentType: "image/png" })).formats).toStrictEqual({ avif: false, webp: false });
	});
});
