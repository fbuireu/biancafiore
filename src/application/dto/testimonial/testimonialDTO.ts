import type { RawTestimonial, TestimonialDTO } from "@application/dto/testimonial/types";
import type { BaseDTO } from "@shared/application/dto/baseDTO";
import { createImage } from "@shared/application/dto/utils/createImage";

export const testimonialDTO: BaseDTO<RawTestimonial[], TestimonialDTO[]> = {
	create: (raw): TestimonialDTO[] => {
		return raw.map((rawTestimonial): TestimonialDTO => {
			return {
				author: rawTestimonial.fields.author,
				quote: rawTestimonial.fields.quote,
				image: createImage(rawTestimonial.fields.image),
				role: rawTestimonial.fields.role,
			} as unknown as TestimonialDTO;
		});
	},
};
