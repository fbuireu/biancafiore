import type { RawArticle } from "@application/dto/article/types";
import { articleReference } from "@application/dto/article/utils/reference";
import type { Reference } from "@domain/shared/reference";

export const AUTHOR_LATEST_ARTICLE_FIELDS: `fields.${string}`[] = [
	"fields.slug",
	"fields.publishDate",
	"fields.author",
];

interface GetLatestArticleByAuthorParams {
	authorSlug: string;
	rawArticles: RawArticle[];
}

const publishedAt = (article: RawArticle): number => Date.parse(article.fields.publishDate) || 0;

export function getLatestArticleByAuthor({
	authorSlug,
	rawArticles,
}: GetLatestArticleByAuthorParams): Reference<"articles"> | undefined {
	const latest = rawArticles
		.filter((article) => "fields" in article.fields.author && article.fields.author.fields.slug.trim() === authorSlug)
		.reduce<RawArticle | undefined>(
			(newest, article) => (!newest || publishedAt(article) > publishedAt(newest) ? article : newest),
			undefined,
		);

	return latest && articleReference(latest);
}
