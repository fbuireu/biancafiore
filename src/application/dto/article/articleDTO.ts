import type { ArticleDTO, RawArticle } from "@application/dto/article/types";
import { ArticleType } from "@application/dto/article/types";
import { createRelatedArticles } from "@application/dto/article/utils/createRelatedArticles";
import { generateTableOfContents } from "@application/dto/article/utils/generateTableOfContents";
import { getRelatedArticles } from "@application/dto/article/utils/getRelatedArticles/getRelatedArticles";
import { DEFAULT_DATE_FORMAT } from "@const/index";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import type { Document } from "@contentful/rich-text-types";
import type { BaseDTO } from "@shared/application/dto/baseDTO";
import { createImage } from "@shared/application/dto/utils/createImage";
import MarkdownIt from "markdown-it";
import { createTags } from "./utils/createTags";
import { generateExcerpt } from "./utils/generateExcerpt";
import { getAuthor } from "./utils/getAuthor";
import { getReadingTime } from "./utils/getReadingTime";
import { renderOptions } from "./utils/renderOptions";

const PARSER: MarkdownIt = new MarkdownIt();

export const articleDTO: BaseDTO<RawArticle[], ArticleDTO[]> = {
	create: (raw) => {
		return raw.map((rawArticle) => {
			const contentHtml = documentToHtmlString(rawArticle.fields.content as unknown as Document);

			const description =
				rawArticle.fields.description ??
				generateExcerpt({
					parser: PARSER,
					content: contentHtml,
				});

			const relatedArticles = rawArticle.fields.relatedArticles
				? createRelatedArticles(rawArticle.fields.relatedArticles)
				: getRelatedArticles({ rawArticle, allRawArticles: raw });
			const featuredImage = rawArticle.fields.featuredImage && createImage(rawArticle.fields.featuredImage);
			const content = documentToHtmlString(rawArticle.fields.content as unknown as Document, renderOptions(rawArticle));

			return {
				title: rawArticle.fields.title,
				author: getAuthor(rawArticle.fields.author),
				slug: rawArticle.fields.slug,
				description,
				publishDate: new Date(String(rawArticle.fields.publishDate)).toLocaleDateString("en", DEFAULT_DATE_FORMAT),
				featuredImage,
				variant: rawArticle.fields.featuredImage ? ArticleType.DEFAULT : ArticleType.NO_IMAGE,
				content,
				isFeaturedArticle: rawArticle.fields.featuredArticle,
				readingTime: getReadingTime(content),
				tag: createTags(rawArticle.fields.tags),
				relatedArticles,
				tableOfContents: generateTableOfContents(contentHtml),
			} as unknown as ArticleDTO;
		});
	},
};
