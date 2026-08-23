import type { RawArticle } from "@application/dto/article/types";
import { createRelatedArticles } from "@application/dto/article/utils/articles";
import { renderArticleContent } from "@application/dto/article/utils/content";
import { articleSlug } from "@application/dto/article/utils/reference";
import { createAuthor } from "@application/dto/author/utils/author";
import { createImage } from "@application/dto/shared/images";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { type ArticleDTO, deriveDescription, generateTableOfContents, getReadingTime } from "@domain/article";
import { formatDate } from "@shared/utils/dates";
import { createTags } from "./utils/tags";

export function createArticles(raw: RawArticle[]): ArticleDTO[] {
	return raw.map((rawArticle): ArticleDTO => {
		const relatedArticles = createRelatedArticles({ rawArticle, allRawArticles: raw });
		const featuredImage = rawArticle.fields.featuredImage && createImage(rawArticle.fields.featuredImage);
		const { content, headings } = renderArticleContent(rawArticle);

		return {
			title: rawArticle.fields.title,
			author: createAuthor(rawArticle.fields.author),
			slug: articleSlug(rawArticle),
			description: deriveDescription(rawArticle.fields.description ?? documentToHtmlString(rawArticle.fields.content)),
			publishDate: formatDate(rawArticle.fields.publishDate),
			publishDateISO: new Date(rawArticle.fields.publishDate).toISOString(),
			updatedAt: rawArticle.sys.updatedAt ?? new Date(rawArticle.fields.publishDate).toISOString(),
			featuredImage,
			content,
			isFeaturedArticle: rawArticle.fields.featuredArticle,
			isFavorite: rawArticle.fields.isFavorite ?? false,
			isRepublished: rawArticle.fields.isRepublished ?? false,
			originalSource: rawArticle.fields.originalSource,
			readingTime: getReadingTime(content),
			tags: createTags(rawArticle.fields.tags),
			relatedArticles,
			tableOfContents: generateTableOfContents(headings),
		};
	});
}
