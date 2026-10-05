import { publishDateISO } from "@domain/article/rules";
import type { Reference } from "@domain/shared/reference";

interface RawArticleIdentity {
	sys?: { id?: string };
	fields: { slug?: unknown };
}

interface RawDatedArticle extends RawArticleIdentity {
	fields: { slug?: unknown; publishDate: string };
}

interface RawFlaggedArticle {
	fields: { isFavorite?: boolean };
}

function nameOf(rawArticle: RawArticleIdentity): string {
	const slug = String(rawArticle.fields.slug ?? "").trim();
	const id = rawArticle.sys?.id;

	return `${slug ? `"${slug}"` : "with no slug"}${id ? ` (sys.id ${id})` : ""}`;
}

export function articleSlug(rawArticle: RawArticleIdentity): string {
	const slug = String(rawArticle.fields.slug ?? "").trim();

	if (!slug) {
		const id = rawArticle.sys?.id;

		throw new Error(
			`A raw article entry${id ? ` (${id})` : ""} reached the mapper with no slug, so nothing can address it`,
		);
	}

	return slug;
}

export function articlePublishDateISO(rawArticle: RawDatedArticle): string {
	try {
		return publishDateISO(rawArticle.fields.publishDate);
	} catch (cause) {
		throw new Error(
			`The Article ${nameOf(rawArticle)} has an unreadable publish date (${String(rawArticle.fields.publishDate)}), so it cannot take its place in the Blog's order`,
			{ cause },
		);
	}
}

export function articleIsFavorite(rawArticle: RawFlaggedArticle): boolean {
	return rawArticle.fields.isFavorite ?? false;
}

export function articleReference(rawArticle: RawArticleIdentity): Reference<"articles"> {
	return { id: articleSlug(rawArticle), collection: "articles" };
}
