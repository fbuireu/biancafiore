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
