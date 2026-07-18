import type { RawArticle } from "@application/dto/article/types";
import type { Reference } from "@shared/application/types";
import type { Entry, EntrySkeletonType, UnresolvedLink } from "contentful";

function isResolvedEntry(entry: Entry<EntrySkeletonType> | UnresolvedLink<"Entry">): entry is Entry<EntrySkeletonType> {
	return "fields" in entry;
}

export function createRelatedArticles(
	relatedArticles: Array<Entry<EntrySkeletonType> | UnresolvedLink<"Entry">> | undefined,
): Reference<"articles">[] {
	return (relatedArticles ?? []).filter(isResolvedEntry).map((relatedArticle) => ({
		id: String(relatedArticle.fields.slug),
		collection: "articles",
	}));
}

interface GetRelatedArticlesParams {
	rawArticle: RawArticle;
	allRawArticles: RawArticle[];
}

function getTagSlugs(article: RawArticle): string[] {
	return (article.fields.tags ?? []).flatMap((tag) => ("fields" in tag ? [tag.fields.slug] : []));
}

export function getRelatedArticles({ rawArticle, allRawArticles }: GetRelatedArticlesParams): Reference<"articles">[] {
	const articleTags = new Set(getTagSlugs(rawArticle));

	return allRawArticles
		.filter((article) => {
			if (article.fields.title === rawArticle.fields.title) return false;

			const allTags = getTagSlugs(article);
			return allTags.some((slug) => articleTags.has(slug));
		})
		.slice(0, 6)
		.map((relatedArticle) => ({
			id: relatedArticle.fields.slug,
			collection: "articles",
		}));
}
