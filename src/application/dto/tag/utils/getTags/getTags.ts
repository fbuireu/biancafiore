import type { ArticleDTO } from "@application/dto/article/types";
import type { TagDTO } from "@application/dto/tag/types";
import { TagType } from "@application/dto/tag/types";
import type { Reference } from "@shared/application/types";

/** Inverts the articles' resolved `tag` terms into the A–Z tag index entries. */
export function getTags(articles: ArticleDTO[]): TagDTO["articles"] {
	const byTag = new Map<string, { name: string; slug: string; articles: Reference<"articles">[] }>();

	for (const article of articles) {
		for (const tag of article.tags ?? []) {
			const slug = tag.slug.trim();
			const entry = byTag.get(slug) ?? { name: tag.name.trim(), slug, articles: [] };
			entry.articles.push({ id: article.slug, collection: "articles" });
			byTag.set(slug, entry);
		}
	}

	return [...byTag.values()].map((tag) => ({
		...tag,
		type: TagType.TAG,
		count: tag.articles.length,
	}));
}
