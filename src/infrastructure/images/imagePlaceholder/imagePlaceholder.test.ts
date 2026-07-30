import { getImagePlaceholder } from "@infrastructure/images/imagePlaceholder";
import { afterEach, describe, expect, it, vi } from "vitest";

const SOURCE = "https://images.ctfassets.net/space/asset/hero.jpg";
const PLACEHOLDER_URL = `${SOURCE}?w=24&q=35&fm=webp`;

const BYTES = new Uint8Array([82, 73, 70, 70]);

interface RespondWithParams {
	ok: boolean;
	bytes?: Uint8Array;
}

const respondWith = ({ ok, bytes = BYTES }: RespondWithParams) => {
	const fetchDouble = vi.fn(async () => ({
		ok,
		arrayBuffer: async () => bytes.buffer,
	}));
	vi.stubGlobal("fetch", fetchDouble);

	return fetchDouble;
};

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("getImagePlaceholder", () => {
	it("requests a 24 pixel wide webp derivative at quality 35", async () => {
		const fetchDouble = respondWith({ ok: true });

		await getImagePlaceholder({ source: SOURCE });

		expect(fetchDouble).toHaveBeenCalledWith(PLACEHOLDER_URL);
	});

	it("returns the fetched bytes as a base64 webp data URL", async () => {
		respondWith({ ok: true });

		await expect(getImagePlaceholder({ source: SOURCE })).resolves.toBe(
			`data:image/webp;base64,${Buffer.from(BYTES).toString("base64")}`,
		);
	});

	it("returns undefined when the CDN answers with a non-ok status", async () => {
		respondWith({ ok: false });

		await expect(getImagePlaceholder({ source: SOURCE })).resolves.toBeUndefined();
	});

	it("returns undefined instead of rejecting when the request itself fails", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				throw new Error("network down");
			}),
		);

		await expect(getImagePlaceholder({ source: SOURCE })).resolves.toBeUndefined();
	});

	it("returns an empty data URL when the response body has no bytes", async () => {
		respondWith({ ok: true, bytes: new Uint8Array() });

		await expect(getImagePlaceholder({ source: SOURCE })).resolves.toBe("data:image/webp;base64,");
	});

	it("fetches a source that is not a parseable URL verbatim, without transform parameters", async () => {
		const fetchDouble = respondWith({ ok: true });

		await getImagePlaceholder({ source: "/local/hero.jpg" });

		expect(fetchDouble).toHaveBeenCalledWith("/local/hero.jpg");
	});
});
