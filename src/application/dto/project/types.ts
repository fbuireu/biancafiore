import type { ContentfulImageAsset, Image } from "@shared/application/types";
import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";

export interface RawProject {
	contentTypeId: "project";
	fields: {
		id: EntryFieldTypes.Text;
		name: EntryFieldTypes.Text;
		description: EntryFieldTypes.RichText;
		image: Entry<EntrySkeletonType<ContentfulImageAsset["fields"]>>;
	};
}

export interface ProjectDTO {
	id: string;
	name: string;
	description: string;
	image: Image;
}
