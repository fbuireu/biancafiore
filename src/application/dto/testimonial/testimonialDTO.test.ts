import { describe, expect, it } from "vitest";
import { createTestimonials } from "./testimonialDTO";
import type { RawTestimonial } from "./types";

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
	quotee?: string;
	quote?: string;
	role?: string;
	image?: unknown;
}

const makeTestimonial = ({
	quotee = "Ada Lovelace",
	quote = "She turned our launch into a story",
	role = "Head of Marketing",
	image = asset(),
}: MakeTestimonialParams = {}) => ({ fields: { author: quotee, quote, image, role } }) as unknown as RawTestimonial;

describe("createTestimonials", () => {
	it("carries the Quotee, quote and role across verbatim and drops nothing else in", () => {
		const [testimonial] = createTestimonials([
			makeTestimonial({
				quotee: "Ada Lovelace",
				quote: "She turned our launch into a story",
				role: "Head of Marketing",
				image: asset({ url: "//cdn/ada.webp", contentType: "image/webp", width: 128, height: 128 }),
			}),
		]);

		expect(testimonial).toEqual({
			quotee: "Ada Lovelace",
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

	it("maps an empty batch to an empty array synchronously, with no promise in sight", () => {
		const result = createTestimonials([]);

		expect(result).toEqual([]);
		expect(result).not.toBeInstanceOf(Promise);
	});

	it("preserves the order of the batch it was given, leaving any ordering rule to the loader", () => {
		const testimonials = createTestimonials([makeTestimonial({ quotee: "Zoe" }), makeTestimonial({ quotee: "Ada" })]);

		expect(testimonials.map(({ quotee }) => quotee)).toEqual(["Zoe", "Ada"]);
	});
});
