import type { CmsEntry } from "@infrastructure/cms/entries";
import type { CmsFlag } from "../shared/flags";
import type { RawImage } from "../shared/images";
import type { PortableTextContent } from "../shared/portableText";

export interface ArticleFields {
	title: string;
	content: PortableTextContent;
	description?: string;
	publish_date: string;
	featured_image?: RawImage | null;
	featured_article?: CmsFlag;
	is_favorite?: CmsFlag;
	is_republished?: CmsFlag;
	original_source?: string;
	seo?: ArticleSeoFields;
}

export interface ArticleSeoFields {
	title: string | null;
	description: string | null;
	image: string | null;
	noIndex: boolean;
}

export const ARTICLE_TAG_TAXONOMY = "tag";

export type ArticleReference = "related_articles";

export type RawArticle<REFERENCE extends ArticleReference = never> = CmsEntry<ArticleFields, REFERENCE>;

export type AnyRawArticle = RawArticle | RawArticle<ArticleReference>;
