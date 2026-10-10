import { type AuthorDTO, authorEntrySchema } from "@domain/author";
import { createAuthors } from "../../dto/author";
import { contentLoader } from "../collection";
import { fetchArticlesAndAuthors } from "../queries";

export const authors = {
	loader: contentLoader<AuthorDTO>({
		name: "authors",
		load: async () => {
			const [rawArticles, rawAuthors] = await fetchArticlesAndAuthors();

			return createAuthors({ rawAuthors, rawArticles });
		},
		identify: (author) => author.slug,
	}),
	schema: authorEntrySchema,
};
