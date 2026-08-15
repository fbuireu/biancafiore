import { defineCollection } from "astro:content";
import { articleDTO } from "@application/dto/article";
import type { ArticleSkeleton } from "@application/dto/article/types";
import { articleSchema, sortFavoriteFirst } from "@domain/article";
import { fetchEntries } from "@infrastructure/cms/entries";
import { getImagePlaceholder } from "@infrastructure/images/imagePlaceholder";

export const articles = defineCollection({
	loader: async () => {
		const [rawArticles] = await fetchEntries<[ArticleSkeleton]>({
			content_type: "article",
			order: ["-fields.publishDate"],
		});

		const sortedArticles = sortFavoriteFirst(articleDTO.create(rawArticles));

		return Promise.all(
			sortedArticles.map(async (article) => ({
				id: article.slug,
				...article,
				featuredImage: article.featuredImage
					? { ...article.featuredImage, placeholder: await getImagePlaceholder({ source: article.featuredImage.url }) }
					: article.featuredImage,
			})),
		);
	},
	schema: articleSchema,
});
