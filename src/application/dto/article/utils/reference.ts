import type { Reference } from "@domain/shared/reference";

interface RawArticleIdentity {
	fields: { slug?: unknown };
}

export function articleSlug(rawArticle: RawArticleIdentity): string {
	return String(rawArticle.fields.slug).trim();
}

export function articleReference(rawArticle: RawArticleIdentity): Reference<"articles"> {
	return { id: articleSlug(rawArticle), collection: "articles" };
}
