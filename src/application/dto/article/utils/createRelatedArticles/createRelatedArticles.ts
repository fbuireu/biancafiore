import type { Reference } from "@shared/application/types";
import type { Entry, EntrySkeletonType } from "contentful";

export function createRelatedArticles(relatedArticles: Array<Entry<EntrySkeletonType>> | undefined): Reference<"articles">[] {
	return (relatedArticles ?? []).map((relatedArticle) => ({
		id: relatedArticle.fields.slug as unknown as string,
		collection: "articles",
	}));
}
