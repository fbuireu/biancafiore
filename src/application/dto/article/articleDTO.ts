import type { ArticleDTO, RawArticle } from "@application/dto/article/types";
import { ArticleType } from "@application/dto/article/types";
import { getRelatedArticles } from "@application/dto/article/utils/getRelatedArticles/getRelatedArticles.ts";
import { DEFAULT_DATE_FORMAT } from "@const/index.ts";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import type { Document } from "@contentful/rich-text-types";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import { createImage } from "@shared/application/dto/utils/createImage";
import MarkdownIt from "markdown-it";
import { createTags } from "./utils/createTags";
import { generateExcerpt } from "./utils/generateExcerpt";
import { getAuthor } from "./utils/getAuthor";

const PARSER: MarkdownIt = new MarkdownIt();

export const articleDTO: BaseDTO<RawArticle[], ArticleDTO[]> = {
	render: (raw) => {
		return raw.map((article) => {
			const description =
				article.fields.description ??
				generateExcerpt({
					parser: PARSER,
					content: documentToHtmlString(article.fields.content as unknown as Document),
				}).excerpt;

			const tags = createTags(article.fields.tags);

			const relatedArticles = article.fields.relatedArticles ?? getRelatedArticles({ article, allArticles: raw });
			const featuredImage = createImage(article.fields.featuredImage);

			return {
				title: article.fields.title,
				author: getAuthor(article.fields.author),
				slug: article.fields.slug,
				description,
				publishDate: new Date(String(article.fields.publishDate)).toLocaleDateString("en", DEFAULT_DATE_FORMAT),
				featuredImage,
				variant: article.fields.featuredImage ? ArticleType.DEFAULT : ArticleType.NO_IMAGE,
				content: documentToHtmlString(article.fields.content as unknown as Document),
				isFeaturedArticle: article.fields.featuredArticle,
				tags,
				relatedArticles,
			} as unknown as ArticleDTO;
		});
	},
};
