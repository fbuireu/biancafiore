import type { RawTestimonial, TestimonialDTO } from "@application/dto/testimonial/types";
import type { BaseDTO } from "@shared/application/dto/baseDTO";
import { createImage } from "@shared/application/dto/utils/createImage";
import type { EmDashEntry } from "@shared/application/types";

export const testimonialDTO: BaseDTO<EmDashEntry<RawTestimonial>[], TestimonialDTO[]> = {
	create: (raw) => {
		return raw.map((entry) => {
			const testimonial = entry.data;

			return {
				author: testimonial.author,
				quote: testimonial.quote,
				image: createImage(testimonial.image),
				role: testimonial.role,
			} as unknown as TestimonialDTO;
		});
	},
};
