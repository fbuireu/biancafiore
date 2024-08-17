import type { ArticleDTO, RawArticle } from "@application/dto/article/types";
import { ArticleType } from "@application/dto/article/types";
import { DEFAULT_DATE_FORMAT } from "@const/const.ts";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import type { Document } from "@contentful/rich-text-types";
import { createImage } from "@shared/application/dto/utils/createImage";
import { getAuthor } from "../getAuthor";
import { getReadingTime } from "../getReadingTime";

const MAX_RELATED_ARTICLES = 3;

interface GetRelatedArticlesProps {
	rawArticle: RawArticle;
	allRawArticles: RawArticle[];
}

export function getRelatedArticles({ rawArticle, allRawArticles }: GetRelatedArticlesProps): ArticleDTO[] {
	const articleTagsSlugs = rawArticle.fields.tags.map((tag) => tag.fields.slug);

	return allRawArticles
		.filter(({ fields }) => {
			const allTagsSlugs = fields.tags?.map((tag) => tag.fields.slug);
			return fields.title !== rawArticle.fields.title && allTagsSlugs?.some((slug) => articleTagsSlugs.includes(slug));
		})
		.slice(0, MAX_RELATED_ARTICLES)
		.map((relatedArticle) => {
			const content = documentToHtmlString(relatedArticle.fields.content as unknown as Document);

			return {
				title: relatedArticle.fields.title,
				slug: relatedArticle.fields.slug,
				content,
				description: relatedArticle.fields.description,
				publishDate: new Date(String(relatedArticle.fields.publishDate)).toLocaleDateString("en", DEFAULT_DATE_FORMAT),
				featuredImage: createImage(relatedArticle.fields.featuredImage),
				variant: relatedArticle.fields.featuredImage ? ArticleType.DEFAULT : ArticleType.NO_IMAGE,
				isFeaturedArticle: relatedArticle.fields.featuredArticle,
				author: getAuthor(relatedArticle.fields.author),
				readingTime: getReadingTime(content),
				tags: relatedArticle.fields.tags.map((tag) => ({
					name: tag.fields.name,
					slug: tag.fields.slug,
				})),
				relatedArticles: [],
			};
		}) as unknown as ArticleDTO[];
}
