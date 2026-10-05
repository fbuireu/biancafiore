import type { z } from "@shared/utils/zod";
import type { tagIndexEntrySchema, tagSchema } from "./schema";

export const TagType = {
	TAG: "tag",
	AUTHOR: "author",
} as const;

export type TagDTO = z.infer<typeof tagSchema>;

export type TagIndexEntryDTO = z.infer<typeof tagIndexEntrySchema>;

export interface TagIndexBucket {
	letter: string;
	entries: TagIndexEntryDTO[];
}
