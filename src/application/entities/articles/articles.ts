import { defineCollection } from "astro:content";
import { createArticles } from "@application/dto/article";
import type { ArticleSkeleton } from "@application/dto/article/types";
import { withImagePlaceholders } from "@application/entities/placeholders";
import { articleSchema, sortFavoriteFirst } from "@domain/article";
import { fetchEntries } from "@infrastructure/cms/entries";

export const articles = defineCollection({
	loader: async () => {
		const [rawArticles] = await fetchEntries<[ArticleSkeleton]>({
			content_type: "article",
			order: ["-fields.publishDate"],
		});

		const articles = await withImagePlaceholders({
			field: "featuredImage",
			entries: sortFavoriteFirst(createArticles(rawArticles)),
		});

		return articles.map((article) => ({ id: article.slug, ...article }));
	},
	schema: articleSchema,
});
