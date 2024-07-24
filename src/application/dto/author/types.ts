import type { ArticleDTO } from "@application/dto/article/types";
import type { EntryFieldTypes } from "contentful";

export interface RawAuthor {
	contentTypeId: "authors";
	fields: {
		name: EntryFieldTypes.Text;
		slug: EntryFieldTypes.Text;
		description: EntryFieldTypes.Text;
		jobTitle: EntryFieldTypes.Text;
		currentCompany: EntryFieldTypes.Text;
		profileImage: EntryFieldTypes.AssetLink;
		socialNetworks: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
	};
}

export interface AuthorDTO {
	name: string;
	slug: string;
	description: string;
	jobTitle: string;
	currentCompany: string;
	profileImage: string;
	socialNetworks: string[];
	articles: ArticleDTO[];
	latestArticle: ArticleDTO;
}
