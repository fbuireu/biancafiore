import { defineCollection, reference, z } from "astro:content";
import { tagDTO } from "@application/dto/tag";
import type { RawTag } from "@application/dto/tag/types";
import { TagType } from "@application/dto/tag/types";
import { tagSchema } from "@application/entities/tags/schema";
import { client } from "@infrastructure/cms/client";

export const tags = defineCollection({
	loader: async () => {
		const { items: rawTags } = await client.getEntries<RawTag>({
			content_type: "tag",
		});

		const tags = await tagDTO.create(rawTags as unknown as RawTag[]);

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
