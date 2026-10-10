import {
	type ArticleDTO,
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
import type { AnyRawArticle } from "./types";
import { createRelatedArticles } from "./utils/articles";
import { prepareArticleContent } from "./utils/content";
import { articleIsFavorite, articlePublishDateISO, articleSlug } from "./utils/reference";
import { articleSeo } from "./utils/seo";
import { createTags, tagsOf } from "./utils/tags";

interface CreateArticlesParams {
	rawArticles: AnyRawArticle[];
	rawAuthors: RawAuthor[];
}

interface CreateArticleParams extends CreateArticlesParams {
	rawArticle: AnyRawArticle;
}

export function createArticles({ rawArticles, rawAuthors }: CreateArticlesParams): ArticleDTO[] {
	return rawArticles.map((rawArticle) => createArticle({ rawArticle, rawArticles, rawAuthors }));
}

export function createArticle({ rawArticle, rawArticles, rawAuthors }: CreateArticleParams): ArticleDTO {
	const relatedArticles = createRelatedArticles({ rawArticle, allRawArticles: rawArticles });
	const featuredImage = rawArticle.data.featured_image ? createImage(rawArticle.data.featured_image) : undefined;
	const { content, headings, prose, readableText } = prepareArticleContent(rawArticle);
	const isRepublished = flagOf(rawArticle.data.is_republished);
	const description = deriveDescription(rawArticle.data.description || prose);

	return {
		title: rawArticle.data.title,
		author: createAuthor(bylineAuthor({ rawArticle, rawAuthors })),
		slug: articleSlug(rawArticle),
		description,
		publishDateISO: articlePublishDateISO(rawArticle),
		updatedAt: publishDateISO(rawArticle.updatedAt),
		featuredImage,
		content,
		isFeaturedArticle: flagOf(rawArticle.data.featured_article),
		isFavorite: articleIsFavorite(rawArticle),
		isRepublished,
		originalSource: creditedSource({ isRepublished, originalSource: rawArticle.data.original_source }),
		seo: articleSeo({ raw: rawArticle.data.seo, title: rawArticle.data.title, description, featuredImage }),
		readingTime: getReadingTime(readableText),
		tags: createTags(tagsOf(rawArticle)),
		relatedArticles,
		tableOfContents: generateTableOfContents(headings),
	};
}
