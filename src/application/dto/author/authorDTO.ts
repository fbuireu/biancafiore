import { type CollectionEntry, getCollection } from 'astro:content';
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";

export interface AuthorData {
  articles: CollectionEntry<"articles">;
}

export type AuthorDTO = {
  data: AuthorData;
} & CollectionEntry<"authors">;

const IMAGES = import.meta.glob("/src/assets/**/*.{jpeg,jpg,png,gif}");

export const authorDTO: BaseDTO<
  CollectionEntry<"authors">,
  AuthorDTO,
  Promise<AuthorDTO>
> = {
  render: async (raw: CollectionEntry<"authors">): Promise<AuthorDTO> => {
    const articles = getCollection("articles");
    const profileImage =  IMAGES[`${raw.data.profileImage}`]

    return {
      ...raw,
      data: {
        ...raw.data,
        profileImage,
        //articles: raw.data.articles.map(articleDTO.render),
      },
    };
  },
};
