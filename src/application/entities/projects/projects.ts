import { defineCollection } from "astro:content";
import { projectsSchema } from "@application/entities/projects/schema";

/**
 * Projects are served live via `getLiveCollection` (see `src/live.config.ts`).
 * This build-time collection exists only to generate the
 * `CollectionEntry<"projects">` types the UI components consume.
 */
export const projects = defineCollection({
	loader: () => [],
	schema: projectsSchema,
});
