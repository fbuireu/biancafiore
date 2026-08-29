import type { RawArticle } from "@application/dto/article/types";
import { articleReference } from "@application/dto/article/utils/reference";
import { publishDateISO } from "@domain/article/rules";
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

interface DatedArticle {
	reference: Reference<"articles">;
	publishedAt: string;
}

export function getLatestArticleByAuthor({
	authorSlug,
	rawArticles,
}: GetLatestArticleByAuthorParams): Reference<"articles"> | undefined {
	const latest = rawArticles
		.filter((article) => "fields" in article.fields.author && article.fields.author.fields.slug.trim() === authorSlug)
		.map<DatedArticle>((article) => ({
			reference: articleReference(article),
			publishedAt: publishDateISO(article.fields.publishDate),
		}))
		.reduce<DatedArticle | undefined>(
			(newest, article) => (!newest || article.publishedAt.localeCompare(newest.publishedAt) > 0 ? article : newest),
			undefined,
		);

	return latest?.reference;
}
