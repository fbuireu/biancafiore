import type { AuthorDTO, RawAuthor } from "@application/dto/author/types";
import type { BaseTagDTO } from "@application/dto/tag/types.ts";
import type { ContentfulImageAsset } from "@shared/application/types";
import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";

export interface RawArticle {
	contentTypeId: "articles";
	sys: {
		id: string;
	};
	fields: {
		title: EntryFieldTypes.Text;
		slug: EntryFieldTypes.Text;
		content: EntryFieldTypes.RichText;
		description: EntryFieldTypes.Text;
		publishDate: EntryFieldTypes.Date;
		featuredImage: Entry<EntrySkeletonType<ContentfulImageAsset["fields"]>>;
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
	featuredImage: FeaturedImage;
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

interface FeaturedImage {
	url: string;
	details: {
		width: number;
		height: number;
	};
}
