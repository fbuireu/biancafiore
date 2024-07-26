import type { ArticleDTO } from "@application/dto/article/types";
import type { ContentfulImageAsset } from "@shared/application/types";
import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";

export interface RawAuthor {
	contentTypeId: "authors";
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
	profileImage: ProfileImage;
	socialNetworks: string[];
	articles: ArticleDTO[];
	latestArticle: ArticleDTO;
}

export interface ProfileImage {
	url: string;
	details: {
		width: number;
		height: number;
	};
}
