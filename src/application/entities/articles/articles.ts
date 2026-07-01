import { defineCollection } from "astro:content";
import { articleDTO } from "@application/dto/article";
import type { RawArticle } from "@application/dto/article/types";
import { articleSchema } from "@application/entities/articles/schema";
import { CmsClient, isContentfulConfigured } from "@infrastructure/cms/client";
import { getImagePlaceholder } from "@infrastructure/images/imagePlaceholder";
import { runCms } from "@infrastructure/runtime";
import { Effect } from "effect";

export const articles = defineCollection({
	loader: async () => {
		if (!isContentfulConfigured()) return [];

		const { items: rawArticles } = await runCms(
			Effect.gen(function* () {
				const cms = yield* CmsClient;
				return yield* cms.getEntries({
					content_type: "article",
					order: ["-fields.publishDate"],
				});
			}),
		);

		const articles = articleDTO.create(rawArticles as unknown as RawArticle[]);

		const sortedArticles = articles.toSorted(
			(a, b) => Number(b.isFavorite) - Number(a.isFavorite) || b.publishDate.localeCompare(a.publishDate),
		);

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
