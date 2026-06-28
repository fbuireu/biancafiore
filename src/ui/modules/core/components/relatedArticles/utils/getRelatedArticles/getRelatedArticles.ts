import type { CollectionEntry } from "astro:content";
import { getEntry } from "astro:content";
import { Effect } from "effect";

export function getRelatedArticles(article: CollectionEntry<"articles">): Promise<CollectionEntry<"articles">[]> {
	return Effect.runPromise(
		Effect.forEach(
			article.data.relatedArticles,
			({ collection, id }) => Effect.promise(async () => await getEntry(collection, id)),
			{ concurrency: "unbounded" },
		).pipe(Effect.map((entries) => entries.filter((entry): entry is CollectionEntry<"articles"> => Boolean(entry)))),
	);
}
