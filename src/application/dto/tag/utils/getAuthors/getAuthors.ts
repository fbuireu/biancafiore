import { type TagDTO, TagType } from "@application/dto/tag/types";
import type { Reference } from "@shared/application/types";

interface AuthorInput {
	name: string;
	slug: string;
	articles: Reference<"articles">[];
}

/** Turns authors (with their resolved article refs) into A–Z index entries. */
export function getAuthors(authors: AuthorInput[]): TagDTO["authors"] {
	return authors
		.filter((author) => author.articles.length > 0)
		.map((author) => ({
			name: author.name.trim(),
			slug: author.slug.trim(),
			type: TagType.AUTHOR,
			count: author.articles.length,
			articles: author.articles,
		}));
}
