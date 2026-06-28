import { defineCollection, reference } from "astro:content";
import { tagDTO } from "@application/dto/tag";
import type { RawTag } from "@application/dto/tag/types";
import { TagType } from "@application/dto/tag/types";
import { tagSchema } from "@application/entities/tags/schema";
import { CmsClient, isContentfulConfigured } from "@infrastructure/cms/client";
import { runCms } from "@infrastructure/runtime";
import { z } from "astro/zod";
import { Effect } from "effect";

export const tags = defineCollection({
	loader: async () => {
		if (!isContentfulConfigured()) return [];

		const [{ items: rawTags }, { items: rawArticles }, { items: rawAuthors }] = await runCms(
			Effect.gen(function* () {
				const cms = yield* CmsClient;
				return yield* Effect.all(
					[
						cms.getEntries({ content_type: "tag", limit: 1000 }),
						cms.getEntries({
							content_type: "article",
							select: ["fields.slug", "fields.tags", "fields.author"],
							limit: 1000,
						}),
						cms.getEntries({ content_type: "author", select: ["fields.name", "fields.slug"], limit: 1000 }),
					],
					{ concurrency: "unbounded" },
				);
			}),
		);

		const tags = await tagDTO.create([rawTags as unknown as RawTag[], rawArticles, rawAuthors]);

		return Object.keys(tags).map((letter) => ({
			id: letter,
			name: letter,
			tags: tags[letter],
		}));
	},
	schema: z.object({
		id: z.string(),
		name: z.string(),
		tags: z.array(
			tagSchema.extend({
				type: z.enum([TagType.TAG, TagType.AUTHOR]),
				count: z.number(),
				articles: z.array(reference("articles")),
			}),
		),
	}),
});
