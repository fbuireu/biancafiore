import type { ArticleDTO } from "@application/dto/article/types";
import type { ContentfulImageAsset, Image } from "@shared/application/types";
import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";

export interface RawAuthor {
	contentTypeId: "author";
	sys: {
		id: string;
	};
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

export interface AuthorDTO {
	name: string;
	slug: string;
	description: string;
	jobTitle: string;
	currentCompany: string;
	profileImage: Image;
	socialNetworks: string[];
	articles: ArticleDTO[];
	latestArticle: ArticleDTO;
}