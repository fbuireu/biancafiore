import { describe, expect, it } from "vitest";
import { MEDIA_FILE_PATH, mediaFileUrl, resolveMedia } from "./media";

describe("resolveMedia", () => {
	it("answers an image stored in the CMS with the same-origin path of its file, which this Worker serves", () => {
		const image = { id: "01M", provider: "local", width: 8, height: 6, meta: { storageKey: "01K.png" } };

		expect(resolveMedia(image)).toEqual({ ...image, src: `${MEDIA_FILE_PATH}01K.png` });
	});

	it("reads an image with no provider as one the CMS stores itself", () => {
		const image = { id: "01M", meta: { storageKey: "01K.png" } };

		expect(resolveMedia(image)).toEqual({ ...image, src: `${MEDIA_FILE_PATH}01K.png` });
	});

	it("leaves an image from another provider exactly as it came", () => {
		const image = { id: "01M", provider: "cloudflare-images", meta: { storageKey: "01K.png" } };

		expect(resolveMedia(image)).toEqual(image);
	});

	it("keeps a src the image already carries rather than rebuilding it", () => {
		const image = { id: "01M", src: "https://example.com/hero.png", meta: { storageKey: "01K.png" } };

		expect(resolveMedia(image)).toEqual(image);
	});

	it("resolves an image wherever it sits, which is how a field of a repeater or a nested block arrives", () => {
		const data = {
			title: "An article",
			featured_image: { id: "01M", meta: { storageKey: "01K.png" } },
			gallery: [{ caption: "a", image: { id: "02M", meta: { storageKey: "02K.png" } } }],
		};

		expect(resolveMedia(data)).toEqual({
			title: "An article",
			featured_image: { id: "01M", meta: { storageKey: "01K.png" }, src: `${MEDIA_FILE_PATH}01K.png` },
			gallery: [
				{ caption: "a", image: { id: "02M", meta: { storageKey: "02K.png" }, src: `${MEDIA_FILE_PATH}02K.png` } },
			],
		});
	});

	it("passes everything that is not media through untouched, a rich-text path already being same-origin", () => {
		const data = {
			title: "A title",
			count: 3,
			flag: false,
			nothing: null,
			list: ["a", 1],
			block: { _type: "image", asset: { _ref: "01M", url: `${MEDIA_FILE_PATH}01K.png` } },
		};

		expect(resolveMedia(data)).toEqual(data);
	});
});

describe("mediaFileUrl", () => {
	it("encodes each segment of a storage key, so a query or fragment delimiter cannot escape the file route", () => {
		expect(mediaFileUrl("folder/a b?c#d.png")).toBe(`${MEDIA_FILE_PATH}folder/a%20b%3Fc%23d.png`);
	});
});
