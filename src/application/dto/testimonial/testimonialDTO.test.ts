import { MEDIA_FILE_PATH } from "@infrastructure/cms/media";
import { rawEntry, rawImage } from "@tests/doubles/cmsEntries";
import { describe, expect, it } from "vitest";
import { createTestimonials } from ".";
import type { TestimonialFields } from "./types";

const makeTestimonial = (fields: Partial<TestimonialFields> = {}) =>
	rawEntry<TestimonialFields>({
		data: {
			author: "Ada Lovelace",
			quote: "She turned our launch into a story",
			role: "Head of Marketing",
			image: rawImage({ name: "avatar.jpg", width: 200, height: 200 }),
			...fields,
		},
	});

describe("createTestimonials", () => {
	it("carries the Quotee, quote and role across verbatim and drops nothing else in", () => {
		const [testimonial] = createTestimonials([
			makeTestimonial({ image: rawImage({ name: "ada.webp", mimeType: "image/webp", width: 128, height: 128 }) }),
		]);

		expect(testimonial).toEqual({
			quotee: "Ada Lovelace",
			quote: "She turned our launch into a story",
			role: "Head of Marketing",
			image: {
				url: `${MEDIA_FILE_PATH}ada.webp`,
				details: { width: 128, height: 128 },
				formats: { avif: false, webp: true },
				shareCrops: expect.any(Array),
			},
		});
	});

	it("trims the Quotee the CMS padded, since the testimonials collection is keyed on the name", () => {
		expect(createTestimonials([makeTestimonial({ author: "  Ada Lovelace\n" })])[0].quotee).toBe("Ada Lovelace");
	});

	it("does not trim the quote, so the CMS whitespace reaches the domain unchanged", () => {
		expect(createTestimonials([makeTestimonial({ quote: "  A padded quote  " })])[0].quote).toBe("  A padded quote  ");
	});

	it("maps an empty batch to an empty array synchronously, with no promise in sight", () => {
		const result = createTestimonials([]);

		expect(result).toEqual([]);
		expect(result).not.toBeInstanceOf(Promise);
	});

	it("preserves the order of the batch it was given, leaving any ordering rule to the loader", () => {
		const testimonials = createTestimonials([makeTestimonial({ author: "Zoe" }), makeTestimonial({ author: "Ada" })]);

		expect(testimonials.map(({ quotee }) => quotee)).toEqual(["Zoe", "Ada"]);
	});
});
