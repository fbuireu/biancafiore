import type { CmsEntry } from "@infrastructure/cms/entries";
import type { RawImage } from "../shared/images";

export interface AuthorFields {
	name: string;
	description: string;
	job_title: string;
	current_company: string;
	profile_image: RawImage;
	social_networks?: Array<{ url: string }>;
}

export const AUTHOR_ARTICLES_FIELD = "articles";

export type RawAuthor = CmsEntry<AuthorFields, typeof AUTHOR_ARTICLES_FIELD>;
