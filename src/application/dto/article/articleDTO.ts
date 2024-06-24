import type { CollectionEntry } from "astro:content";
import { getEntry } from "astro:content";
import { DEFAULT_DATE_FORMAT } from "@const/index.ts";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import { generateExcerpt } from "@shared/application/utils/generateExcerpt";
import MarkdownIt from "markdown-it";

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

export enum ConfigurationTypes {
	ASTRO = "astro",
	REACT = "react",
}

interface ArticleDTOConfiguration {
	type: ConfigurationTypes;
}

const IMAGES = import.meta.glob("/src/assets/**/*.{jpeg,jpg,png,gif}");
const parser: MarkdownIt = new MarkdownIt();

export const articleDTO: BaseDTO<
	CollectionEntry<"articles">,
	ArticleDTO,
	Promise<ArticleDTO>,
	ArticleDTOConfiguration
> = {
	render: async (raw, configuration): Promise<ArticleDTO> => {
		const author = await getEntry(raw.data.author.collection, raw.data.author.slug);
		const description = raw.data.description ?? generateExcerpt({ parser, content: raw.body }).excerpt;
		const publishDate = new Date(raw.data.publishDate).toLocaleDateString("en", DEFAULT_DATE_FORMAT);
		const variant: ArticleType = raw.data.featuredImage ? ArticleType.DEFAULT : ArticleType.NO_IMAGE;
		const featuredImage =
			configuration?.type === ConfigurationTypes.ASTRO ? IMAGES[`${raw.data.featuredImage}`] : raw.data.featuredImage;

		return {
			...raw,
			data: {
				...raw.data,
				author,
				description,
				publishDate,
				featuredImage,
				variant,
			},
		};
	},
};
