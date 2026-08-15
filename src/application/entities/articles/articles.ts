import { defineCollection } from "astro:content";
import { articleDTO } from "@application/dto/article";
import type { ArticleSkeleton } from "@application/dto/article/types";
import { articleSchema, sortFavoriteFirst } from "@domain/article";
import { fetchEntries } from "@infrastructure/cms/entries";
import { getImagePlaceholders } from "@infrastructure/images/imagePlaceholder";

export const articles = defineCollection({
	loader: async () => {
		const [rawArticles] = await fetchEntries<[ArticleSkeleton]>({
			content_type: "article",
			order: ["-fields.publishDate"],
		});

		const sortedArticles = sortFavoriteFirst(articleDTO.create(rawArticles));
		const placeholders = await getImagePlaceholders(
			sortedArticles.flatMap((article) => (article.featuredImage ? [article.featuredImage.url] : [])),
		);

		return sortedArticles.map((article) => ({
			id: article.slug,
			...article,
			featuredImage: article.featuredImage
				? { ...article.featuredImage, placeholder: placeholders.get(article.featuredImage.url) }
				: article.featuredImage,
		}));
	},
	schema: articleSchema,
});
