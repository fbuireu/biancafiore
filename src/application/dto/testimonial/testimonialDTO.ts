import type { RawTestimonial } from "@application/dto/testimonial/types";
import type { BaseDTO } from "@domain/shared/baseDTO";
import type { TestimonialDTO } from "@domain/testimonial";
import { createImage } from "@shared/application/dto/utils/images";

export const testimonialDTO: BaseDTO<RawTestimonial[], TestimonialDTO[]> = {
	create: (raw) => {
		return raw.map((rawTestimonial): TestimonialDTO => {
			return {
				author: rawTestimonial.fields.author,
				quote: rawTestimonial.fields.quote,
				image: createImage(rawTestimonial.fields.image),
				role: rawTestimonial.fields.role,
			};
		});
	},
};
