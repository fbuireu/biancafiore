import { defineCollection, reference } from "astro:content";
import { TagType } from "@application/dto/tag/types";
import { tagSchema } from "@application/entities/tags/schema";
import { z } from "astro/zod";

/**
 * Tags are served live via `getLiveCollection` (see `src/live.config.ts`).
 * This build-time collection exists only to generate the
 * `CollectionEntry<"tags">` types the UI components consume.
 */
export const tags = defineCollection({
	loader: () => [],
	schema: z.object({
		id: z.string(),
		name: z.string(),
		tags: z.array(
			tagSchema.extend({
				type: z.enum([TagType.TAG, TagType.AUTHOR]),
				count: z.number(),
				articles: z.array(reference("articles")),
			}),
		),
	}),
});
