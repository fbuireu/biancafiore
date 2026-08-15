import { defineCollection } from "astro:content";
import { testimonialDTO } from "@application/dto/testimonial";
import type { TestimonialSkeleton } from "@application/dto/testimonial/types";
import { testimonialsSchema } from "@domain/testimonial";
import { fetchEntries } from "@infrastructure/cms/entries";
import { getImagePlaceholders } from "@infrastructure/images/imagePlaceholder";

export const testimonials = defineCollection({
	loader: async () => {
		const [rawTestimonials] = await fetchEntries<[TestimonialSkeleton]>({ content_type: "testimonial" });

		const testimonials = testimonialDTO.create(rawTestimonials);

		const placeholders = await getImagePlaceholders(testimonials.map(({ image }) => image.url));

		return testimonials.map((testimonial) => ({
			id: testimonial.author,
			...testimonial,
			image: { ...testimonial.image, placeholder: placeholders.get(testimonial.image.url) },
		}));
	},
	schema: testimonialsSchema,
});
