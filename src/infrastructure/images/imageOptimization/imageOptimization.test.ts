import { IMAGE_CDN } from "@const/index";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getOptimizedImageUrl, getOptimizedSrcset } from "./imageOptimization";

const SOURCE = "/_emdash/api/media/file/hero.jpg";
const TRANSFORMED_SOURCE = "_emdash/api/media/file/hero.jpg";

const useCdn = (cdn: string) => vi.stubEnv("IMAGE_CDN", cdn);

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("getOptimizedImageUrl on the Cloudflare CDN", () => {
	it("wraps a same-origin source in /cdn-cgi/image with automatic format and the default quality", () => {
		useCdn(IMAGE_CDN.CLOUDFLARE);

		expect(getOptimizedImageUrl({ source: SOURCE })).toBe(
			`/cdn-cgi/image/format=auto,quality=85/${TRANSFORMED_SOURCE}`,
		);
	});

	it("emits the transform parameters in the fixed order format, quality, width, height, fit", () => {
		useCdn(IMAGE_CDN.CLOUDFLARE);

		const url = getOptimizedImageUrl({
			source: SOURCE,
			options: { fit: "cover", height: 600, width: 800, quality: 60, format: "webp" },
		});

		expect(url).toBe(`/cdn-cgi/image/format=webp,quality=60,width=800,height=600,fit=cover/${TRANSFORMED_SOURCE}`);
	});

	it("omits width, height and fit when they are not supplied", () => {
		useCdn(IMAGE_CDN.CLOUDFLARE);

		expect(getOptimizedImageUrl({ source: SOURCE, options: { format: "avif" } })).toBe(
			`/cdn-cgi/image/format=avif,quality=85/${TRANSFORMED_SOURCE}`,
		);
	});

	it("drops a zero width and height because the dimensions are checked for truthiness, not for being defined", () => {
		useCdn(IMAGE_CDN.CLOUDFLARE);

		expect(getOptimizedImageUrl({ source: SOURCE, options: { width: 0, height: 0 } })).toBe(
			`/cdn-cgi/image/format=auto,quality=85/${TRANSFORMED_SOURCE}`,
		);
	});

	it("reads a zero quality as no quality, so the default applies", () => {
		useCdn(IMAGE_CDN.CLOUDFLARE);

		expect(getOptimizedImageUrl({ source: SOURCE, options: { quality: 0 } })).toBe(
			`/cdn-cgi/image/format=auto,quality=85/${TRANSFORMED_SOURCE}`,
		);
	});

	it.each([
		["an absolute url on another host, which the zone would refuse to fetch", "https://images.example.com/hero.jpg"],
		["a protocol-relative url, which names another host too", "//images.example.com/hero.jpg"],
	])("leaves %s untouched", (_case, source) => {
		useCdn(IMAGE_CDN.CLOUDFLARE);

		expect(getOptimizedImageUrl({ source, options: { width: 800 } })).toBe(source);
	});
});

describe("getOptimizedImageUrl without a CDN", () => {
	it("serves the original, because only the production zone answers /cdn-cgi/image", () => {
		useCdn(IMAGE_CDN.NONE);

		expect(getOptimizedImageUrl({ source: SOURCE, options: { width: 800, format: "webp" } })).toBe(SOURCE);
	});

	it("serves the original when no CDN was declared at all, which is what a unit run and a preview build see", () => {
		expect(getOptimizedImageUrl({ source: SOURCE, options: { width: 800 } })).toBe(SOURCE);
	});
});

describe("getOptimizedSrcset", () => {
	it("lists one transformed candidate per width, each tagged with its width descriptor", () => {
		useCdn(IMAGE_CDN.CLOUDFLARE);

		expect(getOptimizedSrcset({ source: SOURCE, widths: [400, 800], options: { format: "webp" } })).toBe(
			[
				`/cdn-cgi/image/format=webp,quality=85,width=400/${TRANSFORMED_SOURCE} 400w`,
				`/cdn-cgi/image/format=webp,quality=85,width=800/${TRANSFORMED_SOURCE} 800w`,
			].join(", "),
		);
	});

	it("repeats the original per width without a CDN, so the markup keeps its shape", () => {
		expect(getOptimizedSrcset({ source: SOURCE, widths: [400, 800] })).toBe(`${SOURCE} 400w, ${SOURCE} 800w`);
	});
});
