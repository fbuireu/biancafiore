import type { AuthorDTO, RawAuthor } from "@application/dto/author/types";
import type { BaseDTO } from "@shared/application/dto/baseDTO";
import { createImage } from "@shared/application/dto/utils/createImage";
import { getArticlesByAuthor } from "./utils";

export const authorDTO: BaseDTO<RawAuthor[], Promise<AuthorDTO[]>> = {
	create: async (raw) => {
		return Promise.all(
			raw.map(async (rawAuthor) => {
				const articlesByAuthor = await getArticlesByAuthor(rawAuthor);

				return {
					name: rawAuthor.fields.name,
					slug: rawAuthor.fields.slug,
					description: rawAuthor.fields.description,
					jobTitle: rawAuthor.fields.jobTitle,
					currentCompany: rawAuthor.fields.currentCompany,
					profileImage: createImage(rawAuthor.fields.profileImage),
					socialNetworks: rawAuthor.fields.socialNetworks,
					articles: articlesByAuthor,
					latestArticle: articlesByAuthor[0],
				} as unknown as AuthorDTO;
			}),
		);
	},
};
