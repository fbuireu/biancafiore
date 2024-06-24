import { type CollectionEntry, getCollection } from "astro:content";
import { ConfigurationTypes, articleDTO } from "@application/dto/article";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import { getArticlesByAuthor } from "./utils/getArticlesByAuthor";

export interface AuthorData {
	articles: CollectionEntry<"articles">;
}

export type AuthorDTO = {
	data: AuthorData;
} & CollectionEntry<"authors">;

const IMAGES = import.meta.glob("/src/assets/**/*.{jpeg,jpg,png,gif}");

export const authorDTO: BaseDTO<CollectionEntry<"authors">, AuthorDTO, Promise<AuthorDTO>> = {
	render: async (raw: CollectionEntry<"authors">): Promise<AuthorDTO> => {
		const articles = await getCollection("articles");
		const profileImage = IMAGES[`${raw.data.profileImage}`];
		const articlesByAuthor = await Promise.all(
			getArticlesByAuthor({ articles, author: raw.data.id })
				.sort((a, b) => new Date(b.data?.publishDate).valueOf() - new Date(a.data?.publishDate).valueOf())
				.map((article) => articleDTO.render(article, { type: ConfigurationTypes.ASTRO })),
		);

		return {
			...raw,
			data: {
				...raw.data,
				profileImage,
				articles: articlesByAuthor,
				latestArticle: articlesByAuthor.at(0),
			},
		};
	},
};
