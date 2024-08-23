import { defineCollection, reference, z } from "astro:content";
import { tagDTO } from "@application/dto/tag";
import { TagType } from "@application/dto/tag/types.ts";
import type { RawTag } from "@application/dto/tag/types.ts";
import { tagSchema } from "@application/entities/tags/schema.ts";
import { client } from "@infrastructure/cms/client.ts";

export const tags = defineCollection({
	loader: async () => {
		const { items: rawTags } = await client.getEntries<RawTag>({
			content_type: "tag",
		});

		const tags = await tagDTO.render(rawTags as unknown as RawTag[]);

		return Object.keys(tags).map((key) => ({
			id: key,
			name: key,
			tags: tags[key],
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
