import { defineCollection, reference } from "astro:content";
import type { ArticleSkeleton } from "@application/dto/article/types";
import { createAuthors } from "@application/dto/author";
import type { AuthorSkeleton } from "@application/dto/author/types";
import { AUTHOR_LATEST_ARTICLE_FIELDS } from "@application/dto/author/utils/articles";
import { authorSchema } from "@domain/author";
import { fetchEntries } from "@infrastructure/cms/entries";

export const authors = defineCollection({
	loader: async () => {
		const [rawAuthors, rawArticles] = await fetchEntries<[AuthorSkeleton, ArticleSkeleton]>(
			{ content_type: "author" },
			{ content_type: "article", select: AUTHOR_LATEST_ARTICLE_FIELDS },
		);

		const authors = createAuthors({ rawAuthors, rawArticles });

		return authors.map((author) => ({ ...author, id: author.name }));
	},
	schema: authorSchema.extend({
		latestArticle: reference("articles").optional(),
	}),
});
