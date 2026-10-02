import { defineCollection } from "astro:content";
import { testimonialSchema } from "@domain/testimonial";
import { createTestimonials } from "../../dto/testimonial";
import type { TestimonialSkeleton } from "../../dto/testimonial/types";
import { cmsCollection } from "../collection";

export const testimonials = defineCollection({
	loader: cmsCollection<TestimonialSkeleton, ReturnType<typeof createTestimonials>[number], "image">({
		query: { content_type: "testimonial" },
		map: createTestimonials,
		imageField: "image",
		identify: (testimonial) => testimonial.quotee,
	}),
	schema: testimonialSchema,
});
