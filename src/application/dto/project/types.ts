import type { z } from "astro:content";
import type { projectsSchema } from "@application/entities/projects";
import type { ContentfulImageAsset } from "@shared/application/types";
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

export type ProjectDTO = z.infer<typeof projectsSchema>;
