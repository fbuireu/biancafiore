import type { AuthorDTO, RawAuthor } from "@application/dto/author/types";
import type { BaseTagDTO } from "@application/dto/tag/types.ts";
import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";

export interface RawArticle {
	contentTypeId: "articles";
	fields: {
		title: EntryFieldTypes.Text;
		slug: EntryFieldTypes.Text;
		content: EntryFieldTypes.RichText;
		description: EntryFieldTypes.Text;
		publishDate: EntryFieldTypes.Date;
		featuredImage: EntryFieldTypes.AssetLink;
		featuredArticle: EntryFieldTypes.Boolean;
		author: Entry<EntrySkeletonType<RawAuthor["fields"]>>;
		tags: Entry<EntrySkeletonType<BaseTagDTO>>[];
		relatedArticles: Array<Entry<EntrySkeletonType>>;
	};
}

export interface ArticleDTO {
	title: string;
	slug: string;
	content: string;
	description: string;
	publishDate: string;
	featuredImage: string;
	variant: ArticleType;
	isFeaturedArticle: boolean;
	author: AuthorDTO;
	tags: BaseTagDTO[];
	relatedArticles: ArticleDTO[];
}

export enum ArticleType {
	DEFAULT = "default",
	NO_IMAGE = "no_image",
}
