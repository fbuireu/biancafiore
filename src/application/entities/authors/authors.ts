import { defineCollection, reference } from "astro:content";
import { authorSchema } from "@application/entities/authors/schema";
import { z } from "astro/zod";

/**
 * Authors are served live via `getLiveCollection` (see `src/live.config.ts`).
 * This build-time collection exists only to generate the
 * `CollectionEntry<"authors">` types the UI components consume.
 */
export const authors = defineCollection({
	loader: () => [],
	schema: authorSchema.extend({
		articles: z.array(reference("articles")).optional(),
		latestArticle: reference("articles").optional(),
	}),
});
