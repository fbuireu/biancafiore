import type { ArticleDTO, RawArticle } from "@application/dto/article/types";
import { ArticleType } from "@application/dto/article/types";
import { getAuthor } from "@application/dto/article/utils/getAuthor";
import { DEFAULT_DATE_FORMAT } from "@const/const.ts";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import type { Document } from "@contentful/rich-text-types";
import type { ContentfulImageAsset } from "@shared/application/types";

const MAX_RELATED_ARTICLES = 3;

interface GetRelatedArticlesProps {
	article: RawArticle;
	allArticles: RawArticle[];
}

export const getRelatedArticles = ({ article, allArticles }: GetRelatedArticlesProps): ArticleDTO[] => {
	const articleTagsSlugs = article.fields.tags.map((tag) => tag.fields.slug);

	return allArticles
		.filter(({ fields }) => {
			const allTagsSlugs = fields.tags?.map((tag) => tag.fields.slug);
			return fields.title !== article.fields.title && allTagsSlugs?.some((slug) => articleTagsSlugs.includes(slug));
		})
		.slice(0, MAX_RELATED_ARTICLES)
		.map((relatedArticle) => ({
			title: relatedArticle.fields.title,
			slug: relatedArticle.fields.slug,
			content: documentToHtmlString(relatedArticle.fields.content as unknown as Document),
			description: relatedArticle.fields.description,
			publishDate: new Date(String(relatedArticle.fields.publishDate)).toLocaleDateString("en", DEFAULT_DATE_FORMAT),
			featuredImage: {
				url: relatedArticle.fields.featuredImage.fields.file.url,
				details: {
					width: (relatedArticle.fields.featuredImage as unknown as ContentfulImageAsset).fields.file.details.image
						.width,
					height: (relatedArticle.fields.featuredImage as unknown as ContentfulImageAsset).fields.file.details.image
						.height,
				},
			},
			variant: relatedArticle.fields.featuredImage ? ArticleType.DEFAULT : ArticleType.NO_IMAGE,
			isFeaturedArticle: relatedArticle.fields.featuredArticle,
			author: getAuthor(relatedArticle.fields.author),
			tags: relatedArticle.fields.tags.map((tag) => ({
				name: tag.fields.name,
				slug: tag.fields.slug,
			})),
			relatedArticles: [],
		})) as unknown as ArticleDTO[];
};
