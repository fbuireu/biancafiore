import type { CollectionEntry } from "astro:content";
import type { ImageDTO } from "@domain/shared/image";

const MAX_TAGS = 4;

export interface ArticleCardTag {
	slug: string;
	name: string;
}

export interface ArticleCardContent {
	slug: string;
	title: string;
	description: string;
	publishDate: string;
	publishDateISO: string;
	readingTime: number;
	author: { slug: string; name: string };
	featuredImage?: ImageDTO;
	visibleTags: ArticleCardTag[];
	remainingTags: number;
}

export function toArticleCardContent({ data }: CollectionEntry<"articles">): ArticleCardContent {
	const tags = data.tags ?? [];
	const visibleTags = tags.slice(0, MAX_TAGS).map(({ slug, name }) => ({ slug, name }));

	return {
		slug: data.slug,
		title: data.title,
		description: data.description,
		publishDate: data.publishDate,
		publishDateISO: data.publishDateISO,
		readingTime: data.readingTime,
		author: { slug: data.author.slug, name: data.author.name },
		featuredImage: data.featuredImage,
		visibleTags,
		remainingTags: tags.length - visibleTags.length,
	};
}
