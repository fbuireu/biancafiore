import type { z } from "astro:content";
import type { ArticleDTO } from "@application/dto/article/types";
import type { authorSchema } from "@application/entities/authors";
import type { ContentfulImageAsset } from "@shared/application/types";
import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";

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

export type AuthorDTO = z.infer<typeof authorSchema> & {
	articles: ArticleDTO[];
	latestArticle: ArticleDTO;
};
