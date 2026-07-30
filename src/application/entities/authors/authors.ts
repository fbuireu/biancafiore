import { defineCollection, reference } from "astro:content";
import type { ArticleSkeleton } from "@application/dto/article/types";
import { authorDTO } from "@application/dto/author";
import type { AuthorSkeleton } from "@application/dto/author/types";
import { authorSchema } from "@domain/author";
import { CmsClient, isContentfulConfigured } from "@infrastructure/cms/client";
import { runCms } from "@infrastructure/runtime";
import { z } from "astro/zod";
import { Effect } from "effect";

export const authors = defineCollection({
	loader: async () => {
		if (!isContentfulConfigured()) return [];

		const [{ items: rawAuthors }, { items: rawArticles }] = await runCms(
			Effect.gen(function* () {
				const cms = yield* CmsClient;
				return yield* Effect.all(
					[
						cms.getEntries<AuthorSkeleton>({ content_type: "author" }),
						cms.getEntries<ArticleSkeleton>({ content_type: "article" }),
					],
					{ concurrency: "unbounded" },
				);
			}),
		);

		const authors = authorDTO.create([rawAuthors, rawArticles]);

		return authors.map((author) => ({
			id: author.name,
			...author,
		}));
	},
	schema: authorSchema.extend({
		articles: z.array(reference("articles")).optional(),
		latestArticle: reference("articles").optional(),
	}),
});
