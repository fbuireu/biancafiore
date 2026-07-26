import type { RawArticle } from "@application/dto/article/types";
import { createRelatedArticles, getRelatedArticles } from "@application/dto/article/utils/articles";
import { renderOptions } from "@application/dto/article/utils/content";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import {
	type ArticleDTO,
	deriveDescription,
	deriveVariant,
	generateTableOfContents,
	getReadingTime,
} from "@domain/article";
import type { BaseDTO } from "@domain/shared/baseDTO";
import { createImage } from "@shared/application/dto/utils/images";
import { formatDate } from "@shared/utils/dates";
import { getAuthor } from "./utils/authors";
import { createTags } from "./utils/tags";

export const articleDTO: BaseDTO<RawArticle[], ArticleDTO[]> = {
	create: (raw): ArticleDTO[] => {
		return raw.map((rawArticle): ArticleDTO => {
			const contentHtml = documentToHtmlString(rawArticle.fields.content);
			const relatedArticles = rawArticle.fields.relatedArticles
				? createRelatedArticles(rawArticle.fields.relatedArticles)
				: getRelatedArticles({ rawArticle, allRawArticles: raw });
			const featuredImage = rawArticle.fields.featuredImage && createImage(rawArticle.fields.featuredImage);
			const content = documentToHtmlString(rawArticle.fields.content, renderOptions(rawArticle));

			return {
				title: rawArticle.fields.title,
				author: getAuthor(rawArticle.fields.author),
				slug: rawArticle.fields.slug,
				description: deriveDescription(rawArticle.fields.description ?? contentHtml),
				publishDate: formatDate(rawArticle.fields.publishDate),
				publishDateISO: new Date(rawArticle.fields.publishDate).toISOString(),
				updatedAt: rawArticle.sys.updatedAt ?? new Date(rawArticle.fields.publishDate).toISOString(),
				featuredImage,
				variant: deriveVariant(Boolean(rawArticle.fields.featuredImage)),
				content,
				isFeaturedArticle: rawArticle.fields.featuredArticle,
				isFavorite: rawArticle.fields.isFavorite ?? false,
				isRepublished: rawArticle.fields.isRepublished ?? false,
				originalSource: rawArticle.fields.originalSource,
				readingTime: getReadingTime(content),
				tags: createTags(rawArticle.fields.tags),
				relatedArticles,
				tableOfContents: generateTableOfContents(contentHtml),
			};
		});
	},
};
