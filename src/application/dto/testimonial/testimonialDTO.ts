import type { TestimonialDTO } from "@domain/testimonial";
import { createImage } from "../shared/images";
import type { RawTestimonial } from "./types";

export function createTestimonials(raw: RawTestimonial[]): TestimonialDTO[] {
	return raw.map((rawTestimonial): TestimonialDTO => {
		return {
			quotee: rawTestimonial.fields.author,
			quote: rawTestimonial.fields.quote,
			image: createImage(rawTestimonial.fields.image),
			role: rawTestimonial.fields.role,
		};
	});
}
