import { getCollection } from "astro:content";
import type { AuthorDTO, RawAuthor } from "@application/dto/author/types";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import { createImage } from "@shared/application/dto/utils/createImage";

export const authorDTO: BaseDTO<RawAuthor[], Promise<AuthorDTO[]>> = {
    render: async (raw) => {
        return Promise.all(
            raw.map(async (rawAuthor) => {
                const articles = (await getCollection("articles")).filter(
                    (article) =>
                        article.data.author?.name ===
                        String(rawAuthor.fields.name)
                );
                const profileImage = rawAuthor.fields.profileImage
                    ? createImage(rawAuthor.fields.profileImage)
                    : "";

                return {
                    name: rawAuthor.fields.name,
                    slug: rawAuthor.fields.slug,
                    description: rawAuthor.fields.description,
                    jobTitle: rawAuthor.fields.jobTitle,
                    currentCompany: rawAuthor.fields.currentCompany,
                    profileImage,
                    socialNetworks: rawAuthor.fields.socialNetworks,
                    articles,
                    latestArticle: articles[0],
                } as unknown as AuthorDTO;
            })
        );
    },
};
