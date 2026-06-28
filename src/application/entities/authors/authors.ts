import { defineCollection, reference } from "astro:content";
import { authorDTO } from "@application/dto/author";
import type { RawAuthor } from "@application/dto/author/types";
import { authorSchema } from "@application/entities/authors/schema";
import { CmsClient, isContentfulConfigured } from "@infrastructure/cms/client";
import { runCms } from "@infrastructure/runtime";
import { z } from "astro/zod";
import { Effect } from "effect";

export const authors = defineCollection({
	loader: async () => {
		if (!isContentfulConfigured()) return [];

		const { items: rawAuthors } = await runCms(
			Effect.gen(function* () {
				const cms = yield* CmsClient;
				return yield* cms.getEntries({ content_type: "author" });
			}),
		);

		const authors = await authorDTO.create(rawAuthors as unknown as RawAuthor[]);

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
