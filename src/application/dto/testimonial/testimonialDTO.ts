import type { BaseDTO } from '@shared/application/dto/baseDTO.ts';
import type { RawTestimonial, TestimonialDTO } from '@application/dto/testimonial/types.ts';
import type { ContentfulImageAsset } from '@shared/application/types';

export const testimonialDTO: BaseDTO<RawTestimonial[], TestimonialDTO[]> = {
	render: (raw) => {
		return raw.map((testimonial) => {
			const image = {
				url: testimonial.fields.image.fields.file.url,
				details: {
					width: (testimonial.fields.image as unknown as ContentfulImageAsset).fields.file.details?.image?.width,
					height: (testimonial.fields.image as unknown as ContentfulImageAsset).fields.file.details?.image?.height,
				},
			};

			return {
				author: testimonial.fields.author,
				quote: testimonial.fields.quote,
				image,
				role: testimonial.fields.role,
			} as unknown as TestimonialDTO;
		});
	},
};
