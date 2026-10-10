import type { TestimonialDTO } from "@domain/testimonial";
import { createImage } from "../shared/images";
import type { RawTestimonial } from "./types";

export function createTestimonials(raw: RawTestimonial[]): TestimonialDTO[] {
	return raw.map(
		({ data }): TestimonialDTO => ({
			quotee: data.author.trim(),
			quote: data.quote,
			image: createImage(data.image),
			role: data.role,
		}),
	);
}
