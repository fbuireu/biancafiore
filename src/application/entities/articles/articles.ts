import { defineCollection } from "astro:content";
import { articleSchema, sortFavoriteFirst } from "@domain/article";
import { createArticles } from "../../dto/article";
import type { ArticleSkeleton } from "../../dto/article/types";
import { cmsCollection } from "../collection";

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
