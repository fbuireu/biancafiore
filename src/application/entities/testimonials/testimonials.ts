import { defineCollection } from "astro:content";
import { createTestimonials } from "@application/dto/testimonial";
import type { TestimonialSkeleton } from "@application/dto/testimonial/types";
import { withImagePlaceholders } from "@application/entities/placeholders";
import { testimonialsSchema } from "@domain/testimonial";
import { fetchEntries } from "@infrastructure/cms/entries";

export const testimonials = defineCollection({
	loader: async () => {
		const [rawTestimonials] = await fetchEntries<[TestimonialSkeleton]>({ content_type: "testimonial" });

		const testimonials = await withImagePlaceholders({ field: "image", entries: createTestimonials(rawTestimonials) });

		return testimonials.map((testimonial) => ({ id: testimonial.author, ...testimonial }));
	},
	schema: testimonialsSchema,
});
