import { defineCollection } from "astro:content";
import { testimonialsSchema } from "@application/entities/testimonials/schema";

/**
 * Testimonials are served live via `getLiveCollection` (see `src/live.config.ts`).
 * This build-time collection exists only to generate the
 * `CollectionEntry<"testimonials">` types the UI components consume.
 */
export const testimonials = defineCollection({
	loader: () => [],
	schema: testimonialsSchema,
});
