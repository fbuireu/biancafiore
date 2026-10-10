import type { ImageDTO } from "@domain/shared/image";
import type { ArticleEntry } from "../../../utils/entries";

const MAX_TAGS = 4;

interface ArticleCardTag {
	slug: string;
	name: string;
}

interface ArticleCardContent {
	slug: string;
	title: string;
	description: string;
	publishDateISO: string;
	readingTime: number;
	author: { slug: string; name: string };
	featuredImage?: ImageDTO;
	visibleTags: ArticleCardTag[];
	remainingTags: number;
}

export function toArticleCardContent({ data }: ArticleEntry): ArticleCardContent {
	const tags = data.tags ?? [];
	const visibleTags = tags.slice(0, MAX_TAGS).map(({ slug, name }) => ({ slug, name }));

	return {
		slug: data.slug,
		title: data.title,
		description: data.description,
		publishDateISO: data.publishDateISO,
		readingTime: data.readingTime,
		author: { slug: data.author.slug, name: data.author.name },
		featuredImage: data.featuredImage,
		visibleTags,
		remainingTags: tags.length - visibleTags.length,
	};
}
