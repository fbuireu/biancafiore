import type { Entry, EntrySkeletonType } from "contentful";
import { type TagDTO, TagType } from "@application/dto/tag/types";
import type { Reference } from "@shared/application/types";

interface GetAuthorsParams {
	rawAuthors: Entry<EntrySkeletonType>[];
	rawArticles: Entry<EntrySkeletonType>[];
}

export function getAuthors({ rawAuthors, rawArticles }: GetAuthorsParams): TagDTO["authors"] {
	return rawAuthors.map((author) => {
		const slug = String(author.fields.slug).trim();
		const articles: Reference<"articles">[] = rawArticles
			.filter((article) => {
				const articleAuthor = article.fields.author as Entry<EntrySkeletonType> | undefined;
				return String(articleAuthor?.fields?.slug).trim() === slug;
			})
			.map((article) => ({
				id: String(article.fields.slug).trim(),
				collection: "articles",
			}));

		return {
			name: String(author.fields.name).trim(),
			slug,
			type: TagType.AUTHOR,
			count: articles.length,
			articles,
		};
	});
}
