import {
	type ArticleDTO,
	type ArticleSummaryDTO,
	creditedSource,
	deriveDescription,
	generateTableOfContents,
	getReadingTime,
	publishDateISO,
} from "@domain/article";
import type { RawAuthor } from "../author/types";
import { bylineAuthor, createAuthor } from "../author/utils/author";
import { flagOf } from "../shared/flags";
import { createImage } from "../shared/images";
import { proseOf, readableTextOf } from "../shared/portableText";
import type { AnyRawArticle } from "./types";
import { createRelatedArticles } from "./utils/articles";
import { prepareArticleContent } from "./utils/content";
import { articleIsFavorite, articlePublishDateISO, articleSlug } from "./utils/reference";
import { articleSeo } from "./utils/seo";
import { createTags, tagsOf } from "./utils/tags";

interface ArticleBatch {
	rawArticles: AnyRawArticle[];
	rawAuthors: RawAuthor[];
}

interface CreateArticleSummaryParams {
	rawArticle: AnyRawArticle;
	rawAuthors: RawAuthor[];
}

interface CreateArticleParams extends ArticleBatch {
	rawArticle: AnyRawArticle;
}

export function createArticleSummaries({ rawArticles, rawAuthors }: ArticleBatch): ArticleSummaryDTO[] {
	return rawArticles.map((rawArticle) => createArticleSummary({ rawArticle, rawAuthors }));
}

function createArticleSummary({ rawArticle, rawAuthors }: CreateArticleSummaryParams): ArticleSummaryDTO {
	const { title, description, content, featured_image } = rawArticle.data;

	return {
		title,
		author: createAuthor(bylineAuthor({ rawArticle, rawAuthors })),
		slug: articleSlug(rawArticle),
		description: deriveDescription(description || proseOf(content)),
		publishDateISO: articlePublishDateISO(rawArticle),
		updatedAt: publishDateISO(rawArticle.updatedAt),
		featuredImage: featured_image ? createImage(featured_image) : undefined,
		isFeaturedArticle: flagOf(rawArticle.data.featured_article),
		isFavorite: articleIsFavorite(rawArticle),
		readingTime: getReadingTime(readableTextOf(content)),
		tags: createTags(tagsOf(rawArticle)),
	};
}

export function createArticles({ rawArticles, rawAuthors }: ArticleBatch): ArticleDTO[] {
	return rawArticles.map((rawArticle) => createArticle({ rawArticle, rawArticles, rawAuthors }));
}

export function createArticle({ rawArticle, rawArticles, rawAuthors }: CreateArticleParams): ArticleDTO {
	const summary = createArticleSummary({ rawArticle, rawAuthors });
	const { content, headings } = prepareArticleContent(rawArticle);
	const isRepublished = flagOf(rawArticle.data.is_republished);

	return {
		...summary,
		isRepublished,
		originalSource: creditedSource({ isRepublished, originalSource: rawArticle.data.original_source }),
		seo: articleSeo({
			raw: rawArticle.data.seo,
			title: summary.title,
			description: summary.description,
			featuredImage: summary.featuredImage,
		}),
		content,
		relatedArticles: createRelatedArticles({ rawArticle, allRawArticles: rawArticles }),
		tableOfContents: generateTableOfContents(headings),
	};
}
