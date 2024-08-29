import type { tagSchema } from "@application/entities/tags/schema";
import type { EntryFieldTypes } from "contentful";
import type { z } from "zod";

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

export enum TagType {
	TAG = "tag",
	AUTHOR = "author",
}

export interface BaseTagDTO {
	name: string;
	slug: string;
}

export type TagDTO = {
	[key: string]: z.infer<typeof tagSchema>[];
};
