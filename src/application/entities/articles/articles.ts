import { defineCollection } from "astro:content";
import { articleDTO } from "@application/dto/article";
import type { RawArticle } from "@application/dto/article/types";
import { articleSchema } from "@application/entities/articles/schema";
import { client } from "@infrastructure/cms/client";

export const articles = defineCollection({
	loader: async () => {
		const { items: rawArticles } = await client.getEntries<RawArticle>({
			content_type: "article",
			order: ["-fields.publishDate"],
		});
		const articles = articleDTO.create(rawArticles as unknown as RawArticle[]);

		return articles.map((article) => ({
			id: article.slug,
			...article,
		}));
	},
	schema: articleSchema,
});
