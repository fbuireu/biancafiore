import { defineCollection } from "astro:content";
import { createTestimonials } from "@application/dto/testimonial";
import type { TestimonialSkeleton } from "@application/dto/testimonial/types";
import { cmsCollection } from "@application/entities/collection";
import { testimonialsSchema } from "@domain/testimonial";

export const testimonials = defineCollection({
	loader: cmsCollection<TestimonialSkeleton, ReturnType<typeof createTestimonials>[number], "image">({
		query: { content_type: "testimonial" },
		map: createTestimonials,
		imageField: "image",
		identify: (testimonial) => testimonial.author,
	}),
	schema: testimonialsSchema,
});
