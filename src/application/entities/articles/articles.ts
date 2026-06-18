import { defineCollection } from "astro:content";
import { articleSchema } from "@application/entities/articles/schema";

/**
 * Articles are served live via `getLiveCollection` (see `src/live.config.ts`).
 * This build-time collection exists only to generate the
 * `CollectionEntry<"articles">` types the UI components consume.
 */
export const articles = defineCollection({
	loader: () => [],
	schema: articleSchema,
});
