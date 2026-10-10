import { publishDateISO } from "@domain/article/rules";
import type { Reference } from "@domain/shared/reference";
import { type CmsFlag, flagOf } from "../../shared/flags";

interface RawArticleIdentity {
	id?: string;
	slug: string | null;
}

interface RawDatedArticle extends RawArticleIdentity {
	data: { publish_date: string };
}

interface RawFlaggedArticle {
	data: { is_favorite?: CmsFlag };
}

const entryOf = ({ id }: RawArticleIdentity): string => (id ? ` (id ${id})` : "");

function nameOf(rawArticle: RawArticleIdentity): string {
	const slug = (rawArticle.slug ?? "").trim();

	return `${slug ? `"${slug}"` : "with no slug"}${entryOf(rawArticle)}`;
}

export function articleSlug(rawArticle: RawArticleIdentity): string {
	const slug = (rawArticle.slug ?? "").trim();

	if (!slug) {
		throw new Error(
			`A raw article entry${entryOf(rawArticle)} reached the mapper with no slug, so nothing can address it`,
		);
	}

	return slug;
}

export function articlePublishDateISO(rawArticle: RawDatedArticle): string {
	try {
		return publishDateISO(rawArticle.data.publish_date);
	} catch (cause) {
		throw new Error(
			`The Article ${nameOf(rawArticle)} has an unreadable publish date (${String(rawArticle.data.publish_date)}), so it cannot take its place in the Blog's order`,
			{ cause },
		);
	}
}

export function articleIsFavorite(rawArticle: RawFlaggedArticle): boolean {
	return flagOf(rawArticle.data.is_favorite);
}

export function articleReference(rawArticle: RawArticleIdentity): Reference<"articles"> {
	return { id: articleSlug(rawArticle), collection: "articles" };
}
