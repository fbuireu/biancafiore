import { articleDTO } from "@application/dto/article";
import type { RawArticle } from "@application/dto/article/types";
import type { AuthorDTO, RawAuthor } from "@application/dto/author/types";
import { client } from "@lib/contentful.ts";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import type { Asset } from "contentful";
import { getArticlesByAuthor } from "./utils/getArticlesByAuthor";

export const authorDTO: BaseDTO<RawAuthor[], Promise<AuthorDTO[]>> = {
	render: async (raw) => {
		const { items: rawArticles } = await client.getEntries<RawArticle>({
			content_type: "articles",
		});
		return raw.map((author) => {
			const articles = articleDTO
				.render(getArticlesByAuthor({ rawArticles, author: author.fields.name as unknown as string }))
				.sort((a, b) => new Date(String(b.publishDate)).valueOf() - new Date(String(a.publishDate)).valueOf());

			return {
				name: author.fields.name,
				slug: author.fields.slug,
				description: author.fields.description,
				jobTitle: author.fields.jobTitle,
				currentCompany: author.fields.currentCompany,
				profileImage: (author.fields.profileImage as unknown as Asset).fields.file?.url,
				socialNetworks: author.fields.socialNetworks,
				articles,
				latestArticle: articles.at(0),
			} as unknown as AuthorDTO;
		});
	},
};
