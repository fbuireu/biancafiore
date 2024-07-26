import { type ArticleDTO, ArticleType, type RawArticle } from "@application/dto/article/types";
import { getRelatedArticles } from "@application/dto/article/utils/getRelatedArticles/getRelatedArticles.ts";
import { DEFAULT_DATE_FORMAT } from "@const/index.ts";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import type { Document } from "@contentful/rich-text-types";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";
import type { ContentfulImageAsset } from "@shared/application/types";
import { generateExcerpt } from "@shared/application/utils/generateExcerpt";
import MarkdownIt from "markdown-it";
import { getAuthor } from "./utils/getAuthor";
import { getTags } from "./utils/getTags";

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

			const tags = getTags(article.fields.tags);

			const relatedArticles = article.fields.relatedArticles ?? getRelatedArticles({ article, allArticles: raw });
			const featuredImage = {
				url: article.fields.featuredImage.fields.file.url,
				details: {
					width: (article.fields.featuredImage as unknown as ContentfulImageAsset).fields.file.details?.image?.width,
					height: (article.fields.featuredImage as unknown as ContentfulImageAsset).fields.file.details?.image?.height,
				},
			};

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
