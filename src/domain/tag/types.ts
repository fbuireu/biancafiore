import type { tagSchema } from "@domain/tag/schema";
import type { z } from "astro/zod";

export const TagType = {
	TAG: "tag",
	AUTHOR: "author",
} as const;

export interface BaseTagDTO {
	name: string;
	slug: string;
}

export type TagDTO = {
	[key: string]: z.infer<typeof tagSchema>[];
};
