import type { ArticleDTO, ArticleResolver, RawArticle } from "@application/dto/article/types";
import { ArticleType } from "@application/dto/article/types";
import { createRelatedArticles } from "@application/dto/article/utils/createRelatedArticles";
import { generateTableOfContents } from "@application/dto/article/utils/generateTableOfContents";
import { getRelatedArticles } from "@application/dto/article/utils/getRelatedArticles/getRelatedArticles";
import { DEFAULT_DATE_FORMAT } from "@const/index";
import type { BaseDTO } from "@shared/application/dto/baseDTO";
import { createImage } from "@shared/application/dto/utils/createImage";
import type { EmDashEntry } from "@shared/application/types";
import { createTags } from "./utils/createTags";
import { getAuthor } from "./utils/getAuthor";
import { getReadingTime } from "./utils/getReadingTime";
import { portableTextToPlainText, renderArticleContent, renderPlainContent } from "./utils/renderOptions";

const HTML_TAG_REGEX = /<\/?[^>]+(>|$)/g;
const DESCRIPTION_MAX_LENGTH = 200;

export const articleDTO: BaseDTO<EmDashEntry<RawArticle>[], ArticleDTO[], ArticleResolver> = {
	create: (raw, resolver): ArticleDTO[] => {
		return raw.map((entry) => {
			const article = entry.data;
			const content = renderArticleContent(article.content);
			const plainHtml = renderPlainContent(article.content);

			const rawDescription = article.description ?? portableTextToPlainText(article.content);
			const cleanDescription = rawDescription.replace(HTML_TAG_REGEX, " ").replace(/\s+/g, " ").trim();
			const description =
				cleanDescription.length > DESCRIPTION_MAX_LENGTH
					? `${cleanDescription.substring(0, DESCRIPTION_MAX_LENGTH)}...`
					: cleanDescription;

			const relatedArticles = article.relatedArticles?.length
				? createRelatedArticles(article.relatedArticles, resolver)
				: getRelatedArticles({ entry, allEntries: raw, resolver });

			const featuredImage = article.featuredImage ? createImage(article.featuredImage) : undefined;

			return {
				title: article.title,
				author: getAuthor(resolver?.authorsById.get(article.author)),
				slug: article.slug,
				description,
				publishDate: new Date(String(article.publishDate)).toLocaleDateString("en", DEFAULT_DATE_FORMAT),
				updatedAt: article.updatedAt ?? new Date(String(article.publishDate)).toISOString(),
				featuredImage,
				variant: article.featuredImage ? ArticleType.DEFAULT : ArticleType.NO_IMAGE,
				content,
				isFeaturedArticle: article.featuredArticle ?? false,
				isRepublished: article.isRepublished ?? false,
				originalSource: article.originalSource,
				readingTime: getReadingTime(content),
				tags: createTags(entry.id, resolver),
				relatedArticles,
				tableOfContents: generateTableOfContents(plainHtml),
			} as unknown as ArticleDTO;
		});
	},
};
