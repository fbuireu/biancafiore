import { IMAGE_CDN } from "@const/index";
import { imageSchema } from "@domain/shared/image";
import { MEDIA_FILE_PATH } from "@infrastructure/cms/media";
import { BLURHASH, rawImage } from "@tests/doubles/cmsEntries";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createImage } from "./images";

const HERO = `${MEDIA_FILE_PATH}hero.jpg`;

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("createImage", () => {
	it("carries the same-origin path the CMS client resolved, which the Worker that renders the page also serves", () => {
		expect(createImage(rawImage()).url).toBe(HERO);
	});

	it("emits an image the domain schema accepts", () => {
		expect(() => imageSchema.parse(createImage(rawImage()))).not.toThrow();
	});

	it("carries the pixel dimensions across from the media", () => {
		expect(createImage(rawImage({ width: 640, height: 480 })).details).toStrictEqual({ width: 640, height: 480 });
	});

	it("flags the modern formats off the mime type and nothing else", () => {
		expect(createImage(rawImage({ mimeType: "image/avif" })).formats).toStrictEqual({ avif: true, webp: false });
		expect(createImage(rawImage({ mimeType: "image/webp" })).formats).toStrictEqual({ avif: false, webp: true });
		expect(createImage(rawImage({ mimeType: "image/png" })).formats).toStrictEqual({ avif: false, webp: false });
	});

	it("carries the share crops a structured-data payload needs, as transform paths the page makes absolute", () => {
		vi.stubEnv("IMAGE_CDN", IMAGE_CDN.CLOUDFLARE);

		expect(createImage(rawImage()).shareCrops).toStrictEqual([
			"/cdn-cgi/image/format=auto,quality=85,width=1200,height=675,fit=cover/_emdash/api/media/file/hero.jpg",
			"/cdn-cgi/image/format=auto,quality=85,width=1200,height=900,fit=cover/_emdash/api/media/file/hero.jpg",
			"/cdn-cgi/image/format=auto,quality=85,width=1200,height=1200,fit=cover/_emdash/api/media/file/hero.jpg",
		]);
	});

	it("shares the original three times without a CDN, rather than inventing crops nothing can serve", () => {
		expect(createImage(rawImage()).shareCrops).toStrictEqual([HERO, HERO, HERO]);
	});

	it("inlines the blurhash EmDash stored on upload as the placeholder, so the page asks for nothing to blur it", () => {
		expect(createImage(rawImage({ blurhash: BLURHASH })).placeholder).toMatch(/^data:image\/bmp;base64,/);
	});

	it("finds the blurhash where EmDash files it under meta, as it does for some formats", () => {
		const image = { ...rawImage(), meta: { storageKey: "hero.jpg", blurhash: BLURHASH } };

		expect(createImage(image).placeholder).toMatch(/^data:image\/bmp;base64,/);
	});

	it("leaves out the placeholder when the media carries no blurhash, so the image renders unblurred", () => {
		expect(createImage(rawImage())).not.toHaveProperty("placeholder");
	});

	it("refuses media the client could not resolve to a file, naming it rather than rendering nothing", () => {
		const unresolved = { id: "01MEDIA", provider: "cloudflare-images", width: 10, height: 10, mimeType: "image/png" };

		expect(() => createImage(unresolved)).toThrow(
			"An image reached the mapper without a resolved file and its dimensions (01MEDIA), so nothing can render it",
		);
	});

	it("refuses media with no dimensions, which a non-image file such as a PDF would be", () => {
		expect(() => createImage({ ...rawImage(), width: undefined, height: undefined })).toThrow("(media-hero.jpg)");
	});

	it("refuses an empty src, which names no file at all", () => {
		expect(() => createImage({ ...rawImage(), src: "" })).toThrow("(media-hero.jpg)");
	});

	it("refuses a required image the entry does not carry at all, saying so", () => {
		expect(() => createImage(undefined)).toThrow("(no media at all)");
	});
});
