import { getImagePlaceholder } from "@infrastructure/images/imagePlaceholder";
import { describe, expect, it } from "vitest";
import { imageDouble } from "@tests/doubles/network";

const SOURCE = "https://images.ctfassets.net/space/asset/hero.jpg";
const PLACEHOLDER_URL = `${SOURCE}?w=24&q=35&fm=webp`;

const BYTES = new Uint8Array([82, 73, 70, 70]);

describe("getImagePlaceholder", () => {
	it("requests a 24 pixel wide webp derivative at quality 35", async () => {
		const cdn = imageDouble({ url: SOURCE, bytes: BYTES.buffer });

		await getImagePlaceholder({ source: SOURCE });

		expect(cdn.calls).toStrictEqual([PLACEHOLDER_URL]);
	});

	it("returns the fetched bytes as a base64 webp data URL", async () => {
		imageDouble({ url: SOURCE, bytes: BYTES.buffer });

		await expect(getImagePlaceholder({ source: SOURCE })).resolves.toBe(
			`data:image/webp;base64,${Buffer.from(BYTES).toString("base64")}`,
		);
	});

	it("returns undefined when the CDN answers with a non-ok status", async () => {
		imageDouble({ url: SOURCE, status: 404 });

		await expect(getImagePlaceholder({ source: SOURCE })).resolves.toBeUndefined();
	});

	it("returns undefined instead of rejecting when the request itself fails", async () => {
		imageDouble({ url: SOURCE, unreachable: true });

		await expect(getImagePlaceholder({ source: SOURCE })).resolves.toBeUndefined();
	});

	it("returns an empty data URL when the response body has no bytes", async () => {
		imageDouble({ url: SOURCE, bytes: new ArrayBuffer(0) });

		await expect(getImagePlaceholder({ source: SOURCE })).resolves.toBe("data:image/webp;base64,");
	});

	it("gives up on a source the platform cannot even turn into a request", async () => {
		const cdn = imageDouble({ url: SOURCE, bytes: BYTES.buffer });

		await expect(getImagePlaceholder({ source: "/local/hero.jpg" })).resolves.toBeUndefined();
		expect(cdn.calls).toEqual([]);
	});
});
