import { defineCollection } from "astro:content";
import { testimonialDTO } from "@application/dto/testimonial";
import type { RawTestimonial } from "@application/dto/testimonial/types.ts";
import { testimonialsSchema } from "@application/entities/testimonials/schema.ts";
import { client } from "@infrastructure/cms/client.ts";

export const testimonials = defineCollection({
	loader: async () => {
		const { items: rawTestimonials } = await client.getEntries<RawTestimonial>({
			content_type: "testimonial",
		});
		const testimonials = testimonialDTO.create(rawTestimonials as unknown as RawTestimonial[]);

		return testimonials.map((testimonial) => ({
			id: testimonial.author,
			...testimonial,
		}));
	},
	schema: testimonialsSchema,
});
