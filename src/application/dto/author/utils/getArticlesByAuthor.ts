import { getCollection } from "astro:content";
import type { RawAuthor } from "@application/dto/author/types";
import type { Reference } from "@shared/application/types";

export async function getArticlesByAuthor(rawAuthor: RawAuthor): Promise<Reference<"articles">[]> {
	const articles = await getCollection("articles");

	return articles
		.filter((article) => article.data.author.name === String(rawAuthor.fields.name))
		.map((article) => ({
			id: article.data.slug,
			collection: "articles",
		}));
}
