import type { z } from "astro:content";
import type { RawAuthor } from "@application/dto/author/types";
import type { BaseTagDTO } from "@application/dto/tag/types";
import type { articleSchema } from "@application/entities/articles";
import type { ContentfulImageAsset } from "@shared/application/types";
import type { Entry, EntryFieldTypes, EntrySkeletonType } from "contentful";

export interface RawArticle {
	contentTypeId: "article";
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

export type ArticleDTO = z.infer<typeof articleSchema>;

export enum ArticleType {
	DEFAULT = "default",
	NO_IMAGE = "no_image",
}
