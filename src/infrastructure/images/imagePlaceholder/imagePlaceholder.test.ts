import { getImagePlaceholders } from "@infrastructure/images/imagePlaceholder";
import { imageDouble, imagesDouble } from "@tests/doubles/network";
import { describe, expect, it } from "vitest";

const SOURCE = "https://images.ctfassets.net/space/asset/hero.jpg";
const PLACEHOLDER_URL = `${SOURCE}?w=24&q=35&fm=webp`;

const BYTES = new Uint8Array([82, 73, 70, 70]);
const DATA_URL = `data:image/webp;base64,${Buffer.from(BYTES).toString("base64")}`;

const PLACEHOLDER_CONCURRENCY = 6;

const sources = (count: number) =>
	Array.from({ length: count }, (_, index) => `https://images.ctfassets.net/space/asset/hero-${index}.jpg`);

describe("getImagePlaceholders", () => {
	it("requests a 24 pixel wide webp derivative at quality 35", async () => {
		const cdn = imageDouble({ url: SOURCE, bytes: BYTES.buffer });

		await getImagePlaceholders([SOURCE]);

		expect(cdn.calls).toStrictEqual([PLACEHOLDER_URL]);
	});

	it("answers each source with its bytes as a base64 webp data URL", async () => {
		imageDouble({ url: SOURCE, bytes: BYTES.buffer });

		await expect(getImagePlaceholders([SOURCE])).resolves.toStrictEqual(new Map([[SOURCE, DATA_URL]]));
	});

	it("keys the answer by the source it was given, not by the derivative it requested", async () => {
		imageDouble({ url: SOURCE, bytes: BYTES.buffer });

		const placeholders = await getImagePlaceholders([SOURCE]);

		expect(placeholders.get(SOURCE)).toBe(DATA_URL);
		expect(placeholders.has(PLACEHOLDER_URL)).toBe(false);
	});

	it("never opens more requests at once than the concurrency it owns", async () => {
		const many = sources(PLACEHOLDER_CONCURRENCY * 3);
		const cdn = imagesDouble({ urls: many, bytes: BYTES.buffer });

		const placeholders = await getImagePlaceholders(many);

		expect(placeholders.size).toBe(many.length);
		expect(cdn.calls).toHaveLength(many.length);
		expect(cdn.maxInFlight).toBeLessThanOrEqual(PLACEHOLDER_CONCURRENCY);
	});

	it("asks once for a source that appears more than once", async () => {
		const cdn = imageDouble({ url: SOURCE, bytes: BYTES.buffer });

		const placeholders = await getImagePlaceholders([SOURCE, SOURCE, SOURCE]);

		expect(cdn.calls).toStrictEqual([PLACEHOLDER_URL]);
		expect(placeholders.size).toBe(1);
	});

	it("retries a request that failed in transit, so a dropped connection does not cost the placeholder", async () => {
		const cdn = imageDouble({ url: SOURCE, bytes: BYTES.buffer, failFirst: 1 });

		await expect(getImagePlaceholders([SOURCE])).resolves.toStrictEqual(new Map([[SOURCE, DATA_URL]]));
		expect(cdn.calls).toStrictEqual([PLACEHOLDER_URL, PLACEHOLDER_URL]);
	});

	it("gives up after the retry rather than asking forever", async () => {
		const cdn = imageDouble({ url: SOURCE, unreachable: true });

		await expect(getImagePlaceholders([SOURCE])).resolves.toStrictEqual(new Map());
		expect(cdn.calls).toStrictEqual([PLACEHOLDER_URL, PLACEHOLDER_URL]);
	});

	it("leaves out a source the CDN answers with a non-ok status", async () => {
		imageDouble({ url: SOURCE, status: 404 });

		await expect(getImagePlaceholders([SOURCE])).resolves.toStrictEqual(new Map());
	});

	it("keeps an empty data URL when the response body has no bytes", async () => {
		imageDouble({ url: SOURCE, bytes: new ArrayBuffer(0) });

		await expect(getImagePlaceholders([SOURCE])).resolves.toStrictEqual(new Map([[SOURCE, "data:image/webp;base64,"]]));
	});

	it("gives up on a source the platform cannot even turn into a request", async () => {
		const cdn = imageDouble({ url: SOURCE, bytes: BYTES.buffer });

		await expect(getImagePlaceholders(["/local/hero.jpg"])).resolves.toStrictEqual(new Map());
		expect(cdn.calls).toEqual([]);
	});

	it("asks for nothing when there is nothing to ask for", async () => {
		const cdn = imageDouble({ url: SOURCE, bytes: BYTES.buffer });

		await expect(getImagePlaceholders([])).resolves.toStrictEqual(new Map());
		expect(cdn.calls).toEqual([]);
	});

	it("loses one source without losing the rest", async () => {
		const other = "https://images.ctfassets.net/space/asset/other.jpg";

		imageDouble({ url: SOURCE, bytes: BYTES.buffer });
		imageDouble({ url: other, status: 404 });

		await expect(getImagePlaceholders([SOURCE, other])).resolves.toStrictEqual(new Map([[SOURCE, DATA_URL]]));
	});
});
