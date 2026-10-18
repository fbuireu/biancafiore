import { MEDIA_FILE_PATH } from "@infrastructure/cms/media";
import { describe, expect, it } from "vitest";
import { SHARE_IMAGE_WIDTH, shareImage } from "./shareImage";

const ORIGIN = "https://biancafiore.test";

interface Requested {
	src: string;
	width: number;
	height: number;
}

interface ImageOfParams {
	width: number;
	height: number;
}

const imageOf = ({ width, height }: ImageOfParams) => ({
	url: `${MEDIA_FILE_PATH}hero.jpg`,
	details: { width, height },
	formats: { avif: false, webp: false },
});

const recordingGetImage = () => {
	const requests: Requested[] = [];

	return {
		requests,
		getImage: async (request: Requested) => {
			requests.push(request);

			return { src: `/_image?href=${encodeURIComponent(request.src)}&w=${request.width}&h=${request.height}` };
		},
	};
};

describe("shareImage", () => {
	it("asks Astro's image service for the media at the share width, from its absolute address, keeping the image's own ratio, because EmDash's endpoint cannot crop", async () => {
		const { requests, getImage } = recordingGetImage();

		await shareImage({ image: imageOf({ width: 2400, height: 1600 }), getImage });

		expect(requests).toStrictEqual([
			{ src: `${ORIGIN}${MEDIA_FILE_PATH}hero.jpg`, width: SHARE_IMAGE_WIDTH, height: 800 },
		]);
	});

	it("never asks for more than the image has, so a narrow image is shared at its own size", async () => {
		const { requests, getImage } = recordingGetImage();

		await shareImage({ image: imageOf({ width: 800, height: 533 }), getImage });

		expect(requests).toStrictEqual([{ src: `${ORIGIN}${MEDIA_FILE_PATH}hero.jpg`, width: 800, height: 533 }]);
	});

	it("answers the rendition as an absolute URL, which a structured-data payload needs", async () => {
		const { getImage } = recordingGetImage();

		expect(await shareImage({ image: imageOf({ width: 1200, height: 675 }), getImage })).toBe(
			`${ORIGIN}/_image?href=${encodeURIComponent(`${ORIGIN}${MEDIA_FILE_PATH}hero.jpg`)}&w=1200&h=675`,
		);
	});

	it("keeps an address the service passed through untransformed, which is already absolute", async () => {
		const passthrough = async ({ src }: Requested) => ({ src });

		expect(await shareImage({ image: imageOf({ width: 1200, height: 675 }), getImage: passthrough })).toBe(
			`${ORIGIN}${MEDIA_FILE_PATH}hero.jpg`,
		);
	});
});
