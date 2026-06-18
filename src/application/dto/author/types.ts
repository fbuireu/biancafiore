import type { ArticleDTO } from "@application/dto/article/types";
import type { authorSchema } from "@application/entities/authors";
import type { EmDashImageField } from "@shared/application/types";
import type { z } from "astro/zod";

/** `data` payload of an EmDash `authors` entry. */
export interface RawAuthor {
	name: string;
	slug: string;
	description: string;
	jobTitle: string;
	currentCompany: string;
	profileImage?: EmDashImageField;
	socialNetworks: string[];
}

export type AuthorDTO = z.infer<typeof authorSchema> & {
	articles: ArticleDTO[];
	latestArticle: ArticleDTO;
};
