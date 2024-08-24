import type { authorSchema } from "@application/entities/authors";
import type { ContentfulImageAsset } from "@shared/application/types";
import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";
import type { z } from "zod";

export interface RawAuthor {
	contentTypeId: "author";
	fields: {
		name: EntryFieldTypes.Text;
		slug: EntryFieldTypes.Text;
		description: EntryFieldTypes.Text;
		jobTitle: EntryFieldTypes.Text;
		currentCompany: EntryFieldTypes.Text;
		profileImage: Entry<EntrySkeletonType<ContentfulImageAsset["fields"]>>;
		socialNetworks: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
	};
}

export type AuthorDTO = z.infer<typeof authorSchema>;
