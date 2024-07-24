import type { ArticleDTO } from "@application/dto/article/types";
import type { EntryFieldTypes } from "contentful";

export interface RawTag {
	contentTypeId: "tags";
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

export interface TagDTOItem extends BaseTagDTO {
	type: TagType;
	count: number;
	articles: ArticleDTO[];
}

export type TagDTO = Record<string, TagDTOItem[]>;
