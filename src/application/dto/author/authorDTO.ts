import { articleDTO } from "@application/dto/article";
import type { RawArticle } from "@application/dto/article/types";
import type { AuthorDTO, RawAuthor } from "@application/dto/author/types";
import { client } from "@infrastructure/cms/client.ts";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import { createImage } from "@shared/application/dto/utils/createImage";

export const authorDTO: BaseDTO<RawAuthor[], Promise<AuthorDTO[]>> = {
	render: async (raw) => {
		return Promise.all(
			raw.map(async (rawAuthor) => {
				const { items: rawArticles } = await client.getEntries({
					content_type: "article",
					"fields.author.sys.id": rawAuthor.sys.id,
					order: ["-fields.publishDate"],
				});

				const articles = articleDTO.render(rawArticles as unknown as RawArticle[]);

				return {
					name: rawAuthor.fields.name,
					slug: rawAuthor.fields.slug,
					description: rawAuthor.fields.description,
					jobTitle: rawAuthor.fields.jobTitle,
					currentCompany: rawAuthor.fields.currentCompany,
					profileImage: createImage(rawAuthor.fields.profileImage),
					socialNetworks: rawAuthor.fields.socialNetworks,
					articles,
					latestArticle: articles[0],
				} as unknown as AuthorDTO;
			}),
		);
	},
};
