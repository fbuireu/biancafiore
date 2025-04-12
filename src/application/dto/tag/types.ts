import type { z } from "astro:content";
import type { tagSchema } from "@application/entities/tags/schema";
import type { EntryFieldTypes } from "contentful";

export interface RawTag {
	contentTypeId: "tag";
	sys: {
		id: string;
	};
	fields: {
		name: EntryFieldTypes.Text;
		slug: EntryFieldTypes.Text;
	};
}

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
