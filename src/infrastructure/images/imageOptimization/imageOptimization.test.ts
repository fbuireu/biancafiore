import { IMAGE_CDN } from "@const/index";
import {
	buildContentfulImageUrl,
	getOptimizedImageUrl,
	getOptimizedSrcset,
} from "@infrastructure/images/imageOptimization";
import { afterEach, describe, expect, it, vi } from "vitest";

const SOURCE = "https://images.ctfassets.net/space/asset/hero.jpg";
const PROTOCOL_RELATIVE_SOURCE = "//images.ctfassets.net/space/asset/hero.jpg";

const useCdn = (cdn: string) => vi.stubEnv("IMAGE_CDN", cdn);

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("getOptimizedImageUrl on the Cloudflare CDN", () => {
	it("wraps the source in /cdn-cgi/image with automatic format and the default quality", () => {
		useCdn(IMAGE_CDN.CLOUDFLARE);

		expect(getOptimizedImageUrl({ source: SOURCE })).toBe(`/cdn-cgi/image/format=auto,quality=85/${SOURCE}`);
	});

	it("makes a protocol-relative source absolute over https before appending it", () => {
		useCdn(IMAGE_CDN.CLOUDFLARE);

		expect(getOptimizedImageUrl({ source: PROTOCOL_RELATIVE_SOURCE })).toBe(
			`/cdn-cgi/image/format=auto,quality=85/${SOURCE}`,
		);
	});

	it("emits the transform parameters in the fixed order format, quality, width, height, fit", () => {
		useCdn(IMAGE_CDN.CLOUDFLARE);

		const url = getOptimizedImageUrl({
			source: SOURCE,
			options: { fit: "cover", height: 600, width: 800, quality: 60, format: "webp" },
		});

		expect(url).toBe(`/cdn-cgi/image/format=webp,quality=60,width=800,height=600,fit=cover/${SOURCE}`);
	});

	it("omits width, height and fit when they are not supplied", () => {
		useCdn(IMAGE_CDN.CLOUDFLARE);

		const url = getOptimizedImageUrl({ source: SOURCE, options: { format: "avif" } });

		expect(url).toBe(`/cdn-cgi/image/format=avif,quality=85/${SOURCE}`);
	});

	it("drops a zero width because the dimensions are checked for truthiness, not for being defined", () => {
		useCdn(IMAGE_CDN.CLOUDFLARE);

		const url = getOptimizedImageUrl({ source: SOURCE, options: { width: 0, height: 0 } });

		expect(url).toBe(`/cdn-cgi/image/format=auto,quality=85/${SOURCE}`);
	});

	it("keeps an explicit zero quality instead of falling back to the default", () => {
		useCdn(IMAGE_CDN.CLOUDFLARE);

		expect(getOptimizedImageUrl({ source: SOURCE, options: { quality: 0 } })).toBe(
			`/cdn-cgi/image/format=auto,quality=0/${SOURCE}`,
		);
	});

	it("is the fallback branch whenever IMAGE_CDN is anything other than contentful", () => {
		useCdn("");

		expect(getOptimizedImageUrl({ source: SOURCE })).toBe(`/cdn-cgi/image/format=auto,quality=85/${SOURCE}`);
	});

	it("leaves a relative source untouched because only // is treated as protocol-relative", () => {
		useCdn(IMAGE_CDN.CLOUDFLARE);

		expect(getOptimizedImageUrl({ source: "/local/hero.jpg" })).toBe(
			"/cdn-cgi/image/format=auto,quality=85//local/hero.jpg",
		);
	});
});

describe("getOptimizedImageUrl on the Contentful CDN", () => {
	it("delegates to the Contentful image API and applies the default quality", () => {
		useCdn(IMAGE_CDN.CONTENTFUL);

		expect(getOptimizedImageUrl({ source: SOURCE })).toBe(`${SOURCE}?q=85`);
	});

	it("lets an explicit quality override the default", () => {
		useCdn(IMAGE_CDN.CONTENTFUL);

		expect(getOptimizedImageUrl({ source: SOURCE, options: { quality: 40 } })).toBe(`${SOURCE}?q=40`);
	});

	it("loses the default quality when quality is passed as an explicit undefined", () => {
		useCdn(IMAGE_CDN.CONTENTFUL);

		expect(getOptimizedImageUrl({ source: SOURCE, options: { quality: undefined, width: 800 } })).toBe(
			`${SOURCE}?w=800`,
		);
	});

	it("translates every option into its Contentful query parameter", () => {
		useCdn(IMAGE_CDN.CONTENTFUL);

		const url = getOptimizedImageUrl({
			source: SOURCE,
			options: { width: 800, height: 600, quality: 70, format: "jpeg", fit: "cover" },
		});

		expect(url).toBe(`${SOURCE}?w=800&h=600&q=70&fm=jpg&fit=fill`);
	});
});

describe("buildContentfulImageUrl", () => {
	it("returns the source unchanged when no options are given beyond a normalised URL", () => {
		expect(buildContentfulImageUrl({ source: SOURCE })).toBe(SOURCE);
	});

	it("makes a protocol-relative source absolute over https", () => {
		expect(buildContentfulImageUrl({ source: PROTOCOL_RELATIVE_SOURCE, options: { width: 320 } })).toBe(
			`${SOURCE}?w=320`,
		);
	});

	it("normalises an origin-only source by adding the root path", () => {
		expect(buildContentfulImageUrl({ source: "https://images.ctfassets.net" })).toBe("https://images.ctfassets.net/");
	});

	it("writes the parameters in the order w, h, q, fm, fit regardless of the option order", () => {
		const url = buildContentfulImageUrl({
			source: SOURCE,
			options: { fit: "pad", format: "png", quality: 50, height: 200, width: 100 },
		});

		expect(url).toBe(`${SOURCE}?w=100&h=200&q=50&fm=png&fit=pad`);
	});

	it("omits every parameter that was not supplied", () => {
		expect(buildContentfulImageUrl({ source: SOURCE, options: { height: 480 } })).toBe(`${SOURCE}?h=480`);
	});

	it("omits the format parameter when the requested format is auto", () => {
		expect(buildContentfulImageUrl({ source: SOURCE, options: { format: "auto", width: 640 } })).toBe(
			`${SOURCE}?w=640`,
		);
	});

	it.each([
		["avif", "avif"],
		["webp", "webp"],
		["jpeg", "jpg"],
		["png", "png"],
	] as const)("maps the %s format to the Contentful fm value %s", (format, expected) => {
		expect(buildContentfulImageUrl({ source: SOURCE, options: { format } })).toBe(`${SOURCE}?fm=${expected}`);
	});

	it.each([
		["scale-down", "scale"],
		["contain", "thumb"],
		["cover", "fill"],
		["crop", "crop"],
		["pad", "pad"],
	] as const)("maps the %s fit to the Contentful fit value %s", (fit, expected) => {
		expect(buildContentfulImageUrl({ source: SOURCE, options: { fit } })).toBe(`${SOURCE}?fit=${expected}`);
	});

	it("keeps query parameters already present on the source and overwrites the ones it owns", () => {
		const url = buildContentfulImageUrl({
			source: `${SOURCE}?fl=progressive&w=100`,
			options: { width: 800, quality: 90 },
		});

		expect(url).toBe(`${SOURCE}?fl=progressive&w=800&q=90`);
	});

	it("drops zero width, height and quality because each is guarded by truthiness", () => {
		expect(buildContentfulImageUrl({ source: SOURCE, options: { width: 0, height: 0, quality: 0 } })).toBe(SOURCE);
	});

	it("returns a source that is not a parseable URL verbatim, ignoring the options", () => {
		expect(buildContentfulImageUrl({ source: "/local/hero.jpg", options: { width: 800, quality: 30 } })).toBe(
			"/local/hero.jpg",
		);
	});

	it("returns an empty source verbatim rather than throwing", () => {
		expect(buildContentfulImageUrl({ source: "", options: { width: 800 } })).toBe("");
	});
});

describe("getOptimizedSrcset", () => {
	it("joins one candidate per width with its width descriptor, comma separated", () => {
		useCdn(IMAGE_CDN.CONTENTFUL);

		expect(getOptimizedSrcset({ source: SOURCE, widths: [320, 640, 1280] })).toBe(
			[`${SOURCE}?w=320&q=85 320w`, `${SOURCE}?w=640&q=85 640w`, `${SOURCE}?w=1280&q=85 1280w`].join(", "),
		);
	});

	it("preserves the given width order rather than sorting it", () => {
		useCdn(IMAGE_CDN.CONTENTFUL);

		expect(getOptimizedSrcset({ source: SOURCE, widths: [1280, 320] })).toBe(
			`${SOURCE}?w=1280&q=85 1280w, ${SOURCE}?w=320&q=85 320w`,
		);
	});

	it("returns an empty string when no widths are requested", () => {
		useCdn(IMAGE_CDN.CONTENTFUL);

		expect(getOptimizedSrcset({ source: SOURCE, widths: [] })).toBe("");
	});

	it("applies the shared options to every candidate on the Cloudflare CDN", () => {
		useCdn(IMAGE_CDN.CLOUDFLARE);

		expect(getOptimizedSrcset({ source: SOURCE, widths: [400, 800], options: { format: "webp", fit: "cover" } })).toBe(
			[
				`/cdn-cgi/image/format=webp,quality=85,width=400,fit=cover/${SOURCE} 400w`,
				`/cdn-cgi/image/format=webp,quality=85,width=800,fit=cover/${SOURCE} 800w`,
			].join(", "),
		);
	});

	it("makes a protocol-relative source absolute in every candidate", () => {
		useCdn(IMAGE_CDN.CONTENTFUL);

		expect(getOptimizedSrcset({ source: PROTOCOL_RELATIVE_SOURCE, widths: [320] })).toBe(`${SOURCE}?w=320&q=85 320w`);
	});
});
