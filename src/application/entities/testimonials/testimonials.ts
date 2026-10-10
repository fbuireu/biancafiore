import { type TestimonialDTO, testimonialSchema } from "@domain/testimonial";
import { fetchEntries } from "@infrastructure/cms/entries";
import { createTestimonials } from "../../dto/testimonial";
import type { RawTestimonial } from "../../dto/testimonial/types";
import { contentLoader } from "../collection";

export const testimonials = {
	loader: contentLoader<TestimonialDTO>({
		name: "testimonials",
		load: async () => {
			const [rawTestimonials] = await fetchEntries<[RawTestimonial]>({
				collection: "testimonials",
				orderBy: "created_at",
				order: "asc",
			});

			return createTestimonials(rawTestimonials);
		},
		identify: (testimonial) => testimonial.quotee,
	}),
	schema: testimonialSchema,
};
