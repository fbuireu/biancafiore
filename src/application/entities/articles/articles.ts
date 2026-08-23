import { defineCollection } from "astro:content";
import { createArticles } from "@application/dto/article";
import type { ArticleSkeleton } from "@application/dto/article/types";
import { cmsCollection } from "@application/entities/collection";
import { articleSchema, sortFavoriteFirst } from "@domain/article";

export const articles = defineCollection({
	loader: cmsCollection<ArticleSkeleton, ReturnType<typeof createArticles>[number], "featuredImage">({
		query: { content_type: "article", order: ["-fields.publishDate"] },
		map: createArticles,
		order: sortFavoriteFirst,
		imageField: "featuredImage",
		identify: (article) => article.slug,
	}),
	schema: articleSchema,
});
