import { articleDTO } from "@application/dto/article";
import type { RawArticle } from "@application/dto/article/types";
import type { AuthorDTO, RawAuthor } from "@application/dto/author/types";
import { client } from "@lib/contentful.ts";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import type { ContentfulImageAsset } from "@shared/application/types";

export const authorDTO: BaseDTO<RawAuthor[], Promise<AuthorDTO[]>> = {
	render: async (raw) => {
		return Promise.all(
			raw.map(async (author) => {
				const { items: rawArticles } = await client.getEntries({
					content_type: "articles",
					"fields.author.sys.id": author.sys.id,
					order: ["-fields.publishDate"],
				});

				const articles = articleDTO.render(rawArticles as unknown as RawArticle[]);

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
					latestArticle: articles[0],
				} as unknown as AuthorDTO;
			}),
		);
	},
};
