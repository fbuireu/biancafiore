import type { tagSchema } from "@application/entities/tags/schema";
import type { z } from "astro/zod";
import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";

export type TagSkeleton = EntrySkeletonType<
	{
		name: EntryFieldTypes.Text;
		slug: EntryFieldTypes.Text;
	},
	"tag"
>;

export type RawTag = Entry<TagSkeleton, undefined>;

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
