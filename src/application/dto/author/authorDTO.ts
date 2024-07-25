import { articleDTO } from "@application/dto/article";
import type { ContentfulImageAsset, RawArticle } from "@application/dto/article/types";
import type { AuthorDTO, RawAuthor } from "@application/dto/author/types";
import { client } from "@lib/contentful.ts";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
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

			const profileImage = {
				url: author.fields.profileImage.fields.file?.url,
				details: {
					width: (author.fields.profileImage as unknown as ContentfulImageAsset).fields.file.details?.image?.width,
					height: (author.fields.profileImage as unknown as ContentfulImageAsset).fields.file.details?.image?.height,
				},
			};

			return {
				name: author.fields.name,
				slug: author.fields.slug,
				description: author.fields.description,
				jobTitle: author.fields.jobTitle,
				currentCompany: author.fields.currentCompany,
				profileImage: profileImage,
				socialNetworks: author.fields.socialNetworks,
				articles,
				latestArticle: articles.at(0),
			} as unknown as AuthorDTO;
		});
	},
};
