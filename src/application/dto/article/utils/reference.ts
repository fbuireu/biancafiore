import type { Reference } from "@domain/shared/reference";

interface RawArticleIdentity {
	fields: { slug?: unknown };
}

export function articleSlug(rawArticle: RawArticleIdentity): string {
	const slug = String(rawArticle.fields.slug ?? "").trim();

	if (!slug) {
		throw new Error("A raw article entry reached the mapper with no slug, so nothing can address it");
	}

	return slug;
}

export function articleReference(rawArticle: RawArticleIdentity): Reference<"articles"> {
	return { id: articleSlug(rawArticle), collection: "articles" };
}
