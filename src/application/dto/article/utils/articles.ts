import type { RawArticle } from "@application/dto/article/types";
import { articleReference, articleSlug } from "@application/dto/article/utils/reference";
import type { Reference } from "@domain/shared/reference";

export const INFERRED_RELATED_ARTICLES_LIMIT = 6;

type AuthoredRelatedArticle = NonNullable<RawArticle["fields"]["relatedArticles"]>[number];
type ResolvedRelatedArticle = Extract<AuthoredRelatedArticle, { fields: unknown }>;

interface CreateRelatedArticlesParams {
	rawArticle: RawArticle;
	allRawArticles: RawArticle[];
}

function isResolvedEntry(entry: AuthoredRelatedArticle): entry is ResolvedRelatedArticle {
	return "fields" in entry;
}

function getTagSlugs(article: RawArticle): string[] {
	return (article.fields.tags ?? []).flatMap((tag) => ("fields" in tag ? [tag.fields.slug] : []));
}

export function createRelatedArticles({
	rawArticle,
	allRawArticles,
}: CreateRelatedArticlesParams): Reference<"articles">[] {
	const ownSlug = articleSlug(rawArticle);
	const authored = rawArticle.fields.relatedArticles;

	if (authored) {
		return authored
			.filter(isResolvedEntry)
			.map((relatedArticle) => articleReference(relatedArticle))
			.filter(({ id }) => id !== ownSlug);
	}

	const articleTags = new Set(getTagSlugs(rawArticle));

	return allRawArticles
		.filter((article) => {
			if (articleSlug(article) === ownSlug) return false;

			return getTagSlugs(article).some((slug) => articleTags.has(slug));
		})
		.slice(0, INFERRED_RELATED_ARTICLES_LIMIT)
		.map((relatedArticle) => articleReference(relatedArticle));
}
