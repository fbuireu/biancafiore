import type { Reference } from "@domain/shared/reference";
import type { CmsReference } from "@infrastructure/cms/entries";
import { publishedEntriesOf } from "../../shared/references";
import type { AnyRawArticle } from "../types";
import { orderArticleReferences } from "./order";
import { articleReference, articleSlug } from "./reference";
import { articleTagSlugs } from "./tags";

const INFERRED_RELATED_ARTICLES_LIMIT = 6;

interface CreateRelatedArticlesParams {
	rawArticle: AnyRawArticle;
	allRawArticles: AnyRawArticle[];
}

const authoredOf = ({ references }: AnyRawArticle): CmsReference[] =>
	"related_articles" in references ? references.related_articles : [];

export function createRelatedArticles({
	rawArticle,
	allRawArticles,
}: CreateRelatedArticlesParams): Reference<"articles">[] {
	const ownSlug = articleSlug(rawArticle);
	const authored = authoredOf(rawArticle);

	if (authored.length > 0) {
		return publishedEntriesOf({ references: authored, published: allRawArticles })
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
