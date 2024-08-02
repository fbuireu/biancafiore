import { articleDTO } from "@application/dto/article";
import type { RawArticle } from "@application/dto/article/types";
import type { AuthorDTO, RawAuthor } from "@application/dto/author/types";
import { client } from "@infrastructure/cms/client";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import { createImage } from "@shared/application/dto/utils/createImage";

export const authorDTO: BaseDTO<RawAuthor[], Promise<AuthorDTO[]>> = {
	render: async (raw) => {
		return Promise.all(
			raw.map(async (author) => {
				const { items: rawArticles } = await client.getEntries({
					content_type: "article",
					"fields.author.sys.id": author.sys.id,
					order: ["-fields.publishDate"],
				});

				const articles = articleDTO.render(rawArticles as unknown as RawArticle[]);

				return {
					name: author.fields.name,
					slug: author.fields.slug,
					description: author.fields.description,
					jobTitle: author.fields.jobTitle,
					currentCompany: author.fields.currentCompany,
					profileImage: createImage(author.fields.profileImage),
					socialNetworks: author.fields.socialNetworks,
					articles,
					latestArticle: articles[0],
				} as unknown as AuthorDTO;
			}),
		);
	},
};
