import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import {
	type ArticleDTO,
	creditedSource,
	deriveDescription,
	generateTableOfContents,
	getReadingTime,
	publishDateISO,
} from "@domain/article";
import { createAuthor } from "../author/utils/author";
import { createImage } from "../shared/images";
import type { RawArticle } from "./types";
import { createRelatedArticles } from "./utils/articles";
import { renderArticleContent } from "./utils/content";
import { articleSlug } from "./utils/reference";
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
