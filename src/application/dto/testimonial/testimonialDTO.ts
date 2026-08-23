import { createImage } from "@application/dto/shared/images";
import type { RawTestimonial } from "@application/dto/testimonial/types";
import type { TestimonialDTO } from "@domain/testimonial";

export function createTestimonials(raw: RawTestimonial[]): TestimonialDTO[] {
	return raw.map((rawTestimonial): TestimonialDTO => {
		return {
			author: rawTestimonial.fields.author,
			quote: rawTestimonial.fields.quote,
			image: createImage(rawTestimonial.fields.image),
			role: rawTestimonial.fields.role,
		};
	});
}
