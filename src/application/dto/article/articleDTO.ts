import type { RawArticle } from "@application/dto/article/types";
import { createRelatedArticles } from "@application/dto/article/utils/articles";
import { renderArticleContent } from "@application/dto/article/utils/content";
import { articleSlug } from "@application/dto/article/utils/reference";
import { createAuthor } from "@application/dto/author/utils/author";
import { createImage } from "@application/dto/shared/images";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import {
	type ArticleDTO,
	creditedSource,
	deriveDescription,
	generateTableOfContents,
	getReadingTime,
	publishDateISO,
} from "@domain/article";
import { createTags } from "./utils/tags";

export function createArticles(raw: RawArticle[]): ArticleDTO[] {
	return raw.map((rawArticle): ArticleDTO => {
		const relatedArticles = createRelatedArticles({ rawArticle, allRawArticles: raw });
		const featuredImage = rawArticle.fields.featuredImage && createImage(rawArticle.fields.featuredImage);
		const { content, headings } = renderArticleContent(rawArticle);
		const isRepublished = rawArticle.fields.isRepublished ?? false;

		return {
			title: rawArticle.fields.title,
			author: createAuthor(rawArticle.fields.author),
			slug: articleSlug(rawArticle),
			description: deriveDescription(rawArticle.fields.description ?? documentToHtmlString(rawArticle.fields.content)),
			publishDateISO: publishDateISO(rawArticle.fields.publishDate),
			updatedAt: publishDateISO(rawArticle.sys.updatedAt ?? rawArticle.fields.publishDate),
			featuredImage,
			content,
			isFeaturedArticle: rawArticle.fields.featuredArticle,
			isFavorite: rawArticle.fields.isFavorite ?? false,
			isRepublished,
			originalSource: creditedSource({ isRepublished, originalSource: rawArticle.fields.originalSource }),
			readingTime: getReadingTime(content),
			tags: createTags(rawArticle.fields.tags),
			relatedArticles,
			tableOfContents: generateTableOfContents(headings),
		};
	});
}
