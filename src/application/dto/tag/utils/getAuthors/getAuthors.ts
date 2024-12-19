import { getCollection } from "astro:content";
import { TagType } from "@application/dto/tag/types";

export async function getAuthors() {
	return (await getCollection("authors")).map((author) => ({
		name: author.data.name,
		slug: author.data.slug,
		type: TagType.AUTHOR,
		count: author.data.articles?.length ?? 0,
		articles: author.data.articles,
	}));
}
