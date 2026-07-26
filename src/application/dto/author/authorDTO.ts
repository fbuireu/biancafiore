import type { RawArticle } from "@application/dto/article/types";
import type { RawAuthor } from "@application/dto/author/types";
import type { AuthorDTO } from "@domain/author";
import type { BaseDTO } from "@domain/shared/baseDTO";
import { createImage } from "@shared/application/dto/utils/images";
import { getArticlesByAuthor } from "./utils/articles";

export const authorDTO: BaseDTO<[RawAuthor[], RawArticle[]], Promise<AuthorDTO[]>> = {
	create: async ([raw, rawArticles]) => {
		return raw.map((rawAuthor): AuthorDTO => {
			const articlesByAuthor = getArticlesByAuthor({ rawAuthor, rawArticles });

			return {
				name: rawAuthor.fields.name,
				slug: rawAuthor.fields.slug,
				description: rawAuthor.fields.description,
				jobTitle: rawAuthor.fields.jobTitle,
				currentCompany: rawAuthor.fields.currentCompany,
				profileImage: createImage(rawAuthor.fields.profileImage),
				socialNetworks: rawAuthor.fields.socialNetworks,
				articles: articlesByAuthor,
				latestArticle: articlesByAuthor.at(0),
			};
		});
	},
};
