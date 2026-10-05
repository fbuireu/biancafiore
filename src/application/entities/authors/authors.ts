import { defineCollection } from "astro:content";
import { authorEntrySchema } from "@domain/author";
import { fetchEntries } from "@infrastructure/cms/entries";
import type { ArticleSkeleton } from "../../dto/article/types";
import { createAuthors } from "../../dto/author";
import type { AuthorSkeleton } from "../../dto/author/types";
import { AUTHOR_LATEST_ARTICLE_FIELDS } from "../../dto/author/utils/articles";

export const authors = defineCollection({
	loader: async () => {
		const [rawAuthors, rawArticles] = await fetchEntries<[AuthorSkeleton, ArticleSkeleton]>(
			{ content_type: "author" },
			{ content_type: "article", select: AUTHOR_LATEST_ARTICLE_FIELDS },
		);

		const authors = createAuthors({ rawAuthors, rawArticles });

		return authors.map((author) => ({ ...author, id: author.slug }));
	},
	schema: authorEntrySchema,
});
