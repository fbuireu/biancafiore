import { createTestimonials } from "@application/dto/testimonial";
import type { RawTestimonial } from "@application/dto/testimonial/types";
import { describe, expect, it } from "vitest";

interface AssetParams {
	url?: string;
	contentType?: string;
	width?: number;
	height?: number;
}

const asset = ({
	url = "//images.ctfassets.net/avatar.jpg",
	contentType = "image/jpeg",
	width = 200,
	height = 200,
}: AssetParams = {}) => ({
	fields: { file: { url, contentType, details: { size: 512, image: { width, height } } } },
});

interface MakeTestimonialParams {
	author?: string;
	quote?: string;
	role?: string;
	image?: unknown;
}

const makeTestimonial = ({
	author = "Ada Lovelace",
	quote = "She turned our launch into a story",
	role = "Head of Marketing",
	image = asset(),
}: MakeTestimonialParams = {}) => ({ fields: { author, quote, image, role } }) as unknown as RawTestimonial;

describe("createTestimonials", () => {
	it("carries author, quote and role across verbatim and drops nothing else in", () => {
		const [testimonial] = createTestimonials([
			makeTestimonial({
				author: "Ada Lovelace",
				quote: "She turned our launch into a story",
				role: "Head of Marketing",
				image: asset({ url: "//cdn/ada.webp", contentType: "image/webp", width: 128, height: 128 }),
			}),
		]);

		expect(testimonial).toEqual({
			author: "Ada Lovelace",
			quote: "She turned our launch into a story",
			role: "Head of Marketing",
			image: {
				url: "https://cdn/ada.webp",
				details: { width: 128, height: 128 },
				formats: { avif: false, webp: true },
				shareCrops: expect.any(Array),
			},
		});
	});

	it("does not trim the quote, so the CMS whitespace reaches the domain unchanged", () => {
		const [testimonial] = createTestimonials([makeTestimonial({ quote: "  A padded quote  " })]);

		expect(testimonial.quote).toBe("  A padded quote  ");
	});

	it("flags an avif asset as avif and nothing else", () => {
		const [testimonial] = createTestimonials([
			makeTestimonial({ image: asset({ url: "//cdn/ada.avif", contentType: "image/avif" }) }),
		]);

		expect(testimonial.image.formats).toEqual({ avif: true, webp: false });
	});

	it("flags a jpeg asset as neither avif nor webp", () => {
		const [testimonial] = createTestimonials([makeTestimonial({ image: asset({ contentType: "image/jpeg" }) })]);

		expect(testimonial.image.formats).toEqual({ avif: false, webp: false });
	});

	it("maps an empty batch to an empty array synchronously, with no promise in sight", () => {
		const result = createTestimonials([]);

		expect(result).toEqual([]);
		expect(result).not.toBeInstanceOf(Promise);
	});

	it("preserves the order of the batch it was given, leaving any ordering rule to the loader", () => {
		const testimonials = createTestimonials([makeTestimonial({ author: "Zoe" }), makeTestimonial({ author: "Ada" })]);

		expect(testimonials.map(({ author }) => author)).toEqual(["Zoe", "Ada"]);
	});
});
