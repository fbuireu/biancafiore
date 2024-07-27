import type { RawTestimonial, TestimonialDTO } from "@application/dto/testimonial/types.ts";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import { createImage } from "@shared/application/dto/utils/createImage";

export const testimonialDTO: BaseDTO<RawTestimonial[], TestimonialDTO[]> = {
	render: (raw) => {
		return raw.map((testimonial) => {
			return {
				author: testimonial.fields.author,
				quote: testimonial.fields.quote,
				image: createImage(testimonial.fields.image),
				role: testimonial.fields.role,
			} as unknown as TestimonialDTO;
		});
	},
};
