import { defineCollection, reference, z } from "astro:content";
import { authorDTO } from "@application/dto/author";
import type { RawAuthor } from "@application/dto/author/types.ts";
import { authorSchema } from "@application/entities/authors/schema.ts";
import { client } from "@infrastructure/cms/client.ts";

export const authors = defineCollection({
	loader: async () => {
		const { items: rawAuthors } = await client.getEntries<RawAuthor>({
			content_type: "author",
		});
		const authors = await authorDTO.render(rawAuthors as unknown as RawAuthor[]);

		return authors.map((author) => ({
			id: author.name,
			...author,
		}));
	},
	schema: authorSchema.extend({
		articles: z.array(reference("articles")),
		latestArticle: reference("articles"),
	}),
});