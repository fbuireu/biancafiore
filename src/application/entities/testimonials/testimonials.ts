import { defineCollection } from "astro:content";
import { testimonialDTO } from "@application/dto/testimonial";
import type { RawTestimonial } from "@application/dto/testimonial/types";
import { testimonialsSchema } from "@application/entities/testimonials/schema";
import { CmsClient, isContentfulConfigured } from "@infrastructure/cms/client";
import { getImagePlaceholder } from "@infrastructure/images/imagePlaceholder";
import { runCms } from "@infrastructure/runtime";
import { Effect } from "effect";

export const testimonials = defineCollection({
	loader: async () => {
		if (!isContentfulConfigured()) return [];

		const { items: rawTestimonials } = await runCms(
			Effect.gen(function* () {
				const cms = yield* CmsClient;
				return yield* cms.getEntries({ content_type: "testimonial" });
			}),
		);

		const testimonials = testimonialDTO.create(rawTestimonials as unknown as RawTestimonial[]);

		return Promise.all(
			testimonials.map(async (testimonial) => ({
				id: testimonial.author,
				...testimonial,
				image: { ...testimonial.image, placeholder: await getImagePlaceholder({ source: testimonial.image.url }) },
			})),
		);
	},
	schema: testimonialsSchema,
});
