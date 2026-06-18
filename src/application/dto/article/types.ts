import type { RawAuthor } from "@application/dto/author/types";
import type { BaseTagDTO } from "@application/dto/tag/types";
import type { articleSchema } from "@application/entities/articles";
import type { EmDashEntry, EmDashImageField, PortableTextBlock } from "@shared/application/types";
import type { z } from "astro/zod";

/**
 * `data` payload of an EmDash `articles` entry. The reference fields (`author`,
 * `relatedArticles`) are stored as entry-id strings; tags are **taxonomy terms**
 * (not a field), resolved separately via {@link ArticleResolver}.
 */
export interface RawArticle {
	title: string;
	slug: string;
	content: PortableTextBlock[];
	description?: string;
	publishDate: string;
	featuredImage?: EmDashImageField;
	featuredArticle?: boolean;
	isRepublished?: boolean;
	originalSource?: string;
	author: string;
	relatedArticles?: string[];
	updatedAt?: string;
}

/**
 * Lookups the article DTO uses to resolve the author reference, the `tag`
 * taxonomy terms (keyed by article id) and the related-article slugs the Astro
 * `reference()` schema expects.
 */
export interface ArticleResolver {
	authorsById: Map<string, EmDashEntry<RawAuthor>>;
	tagsByArticleId: Map<string, BaseTagDTO[]>;
	articleSlugById: Map<string, string>;
}

export type ArticleDTO = z.infer<typeof articleSchema>;

export const ArticleType = {
	DEFAULT: "default",
	NO_IMAGE: "no_image",
} as const;
