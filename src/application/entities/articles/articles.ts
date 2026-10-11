import {
	type ArticleDTO,
	type ArticleSummaryDTO,
	articleSchema,
	articleSummarySchema,
	sortFavoriteFirst,
} from "@domain/article";
import { fetchPreview, fetchReferences } from "@infrastructure/cms/entries";
import { createArticle, createArticleSummaries, createArticles } from "../../dto/article";
import { isPreviewed } from "../../dto/article/utils/preview";
import { articleSlug } from "../../dto/article/utils/reference";
import { creditedAuthors } from "../../dto/author/utils/author";
import { contentLoader } from "../collection";
import { fetchArticle, fetchArticlesAndAuthors } from "../queries";

export const RELATED_ARTICLES_FIELD = "related_articles";

export const articles = {
	loader: contentLoader<ArticleSummaryDTO>({
		name: "articles",
		load: async () => {
			const [rawArticles, rawAuthors] = await fetchArticlesAndAuthors();

			return sortFavoriteFirst(createArticleSummaries({ rawArticles, rawAuthors }));
		},
		identify: (summary) => summary.slug,
	}),
	schema: articleSummarySchema,
};

export const article = {
	loader: contentLoader<ArticleDTO>({
		name: "article",
		load: async () => {
			const [rawArticles, rawAuthors] = await fetchArticlesAndAuthors();

			return sortFavoriteFirst(createArticles({ rawArticles, rawAuthors }));
		},
		loadOne: async (slug) => {
			const [rawArticles] = await fetchArticlesAndAuthors();
			const rawArticle = rawArticles.find((candidate) => articleSlug(candidate) === slug) ?? (await fetchArticle(slug));

			if (!rawArticle) return undefined;

			const [related, preview] = await Promise.all([
				fetchReferences({ collection: "articles", id: rawArticle.id, field: RELATED_ARTICLES_FIELD }),
				fetchPreview(),
			]);

			return createArticle({
				rawArticle: { ...rawArticle, references: { [RELATED_ARTICLES_FIELD]: related } },
				rawArticles,
				rawAuthors: creditedAuthors([rawArticle, ...rawArticles]),
				isPreview: isPreviewed({ preview, rawArticle }),
			});
		},
		identify: (whole) => whole.slug,
	}),
	schema: articleSchema,
};
