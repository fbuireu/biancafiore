import { defineCollection } from "astro:content";
import { citiesSchema } from "@application/entities/cities/schema";

/**
 * Cities are served live via `getLiveCollection` (see `src/live.config.ts`).
 * This build-time collection exists only to generate the
 * `CollectionEntry<"cities">` types the UI components consume.
 */
export const cities = defineCollection({
	loader: () => [],
	schema: citiesSchema,
});
