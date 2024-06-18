import type { CollectionEntry } from "astro:content";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import MarkdownIt from "markdown-it";
import { generateExcerpt } from "@shared/application/utils/generateExcerpt";
import { getEntry } from "astro:content";
import { DEFAULT_DATE_FORMAT } from "@const/index.ts";
import type { ImageMetadata } from "astro";

export enum ArticleType {
	DEFAULT = "default",
	NO_IMAGE = "no_image",
}

export interface ArticleData {
	author: CollectionEntry<"authors">;
	description: string;
	publishDate: string;
	variant: ArticleType;
}

export type ArticleDTO = {
	data: ArticleData;
} & CollectionEntry<"articles">;

const parser: MarkdownIt = new MarkdownIt();

export const articleDTO: BaseDTO<CollectionEntry<"articles">, ArticleDTO, Promise<ArticleDTO>> = {
	render: async (raw: CollectionEntry<"articles">): Promise<ArticleDTO> => {
		const author = await getEntry(raw.data.author.collection, raw.data.author.slug);
		const description = raw.data.description ?? generateExcerpt({ parser, content: raw.body }).excerpt;
		const publishDate = new Date(raw.data.publishDate).toLocaleDateString("en", DEFAULT_DATE_FORMAT);
		const variant: ArticleType = raw.data.featuredImage ? ArticleType.DEFAULT : ArticleType.NO_IMAGE;

		return {
			...raw,
			data: {
				...raw.data,
				author,
				description,
				publishDate,
				variant,
			},
		};
	},
};
