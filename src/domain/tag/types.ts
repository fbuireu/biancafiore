import type { tagIndexEntrySchema, tagSchema } from "@domain/tag/schema";
import type { z } from "astro/zod";

export const TagType = {
	TAG: "tag",
	AUTHOR: "author",
} as const;

export type TagDTO = z.infer<typeof tagSchema>;

export type TagIndexEntryDTO = z.infer<typeof tagIndexEntrySchema>;
