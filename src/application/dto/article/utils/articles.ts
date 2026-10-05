import type { Reference } from "@domain/shared/reference";
import { articleTagSlugs } from "../../tag/utils/tag";
import type { RawArticle } from "../types";
import { orderArticleReferences } from "./order";
import { articleReference, articleSlug } from "./reference";

const INFERRED_RELATED_ARTICLES_LIMIT = 6;

type AuthoredRelatedArticle = NonNullable<RawArticle["fields"]["relatedArticles"]>[number];
type ResolvedRelatedArticle = Extract<AuthoredRelatedArticle, { fields: unknown }>;

interface CreateRelatedArticlesParams {
	rawArticle: RawArticle;
	allRawArticles: RawArticle[];
}

function isResolvedEntry(entry: AuthoredRelatedArticle): entry is ResolvedRelatedArticle {
	return "fields" in entry;
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

	const articleTags = new Set(articleTagSlugs(rawArticle));

	return orderArticleReferences(
		allRawArticles.filter((article) => {
			if (articleSlug(article) === ownSlug) return false;

			return articleTagSlugs(article).some((slug) => articleTags.has(slug));
		}),
	).slice(0, INFERRED_RELATED_ARTICLES_LIMIT);
}
