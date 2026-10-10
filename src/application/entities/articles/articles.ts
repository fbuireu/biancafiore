import { type ArticleDTO, articleSchema, sortFavoriteFirst } from "@domain/article";
import { fetchReferences } from "@infrastructure/cms/entries";
import { createArticle, createArticles } from "../../dto/article";
import { articleSlug } from "../../dto/article/utils/reference";
import { contentLoader } from "../collection";
import { fetchArticlesAndAuthors } from "../queries";

export const RELATED_ARTICLES_FIELD = "related_articles";

export const articles = {
	loader: contentLoader<ArticleDTO>({
		name: "articles",
		load: async () => {
			const [rawArticles, rawAuthors] = await fetchArticlesAndAuthors();

			return sortFavoriteFirst(createArticles({ rawArticles, rawAuthors }));
		},
		loadOne: async (slug) => {
			const [rawArticles, rawAuthors] = await fetchArticlesAndAuthors();
			const rawArticle = rawArticles.find((article) => articleSlug(article) === slug);

			if (!rawArticle) return undefined;

			const related = await fetchReferences({
				collection: "articles",
				id: rawArticle.id,
				field: RELATED_ARTICLES_FIELD,
			});

			return createArticle({
				rawArticle: { ...rawArticle, references: { [RELATED_ARTICLES_FIELD]: related } },
				rawArticles,
				rawAuthors,
			});
		},
		identify: (article) => article.slug,
	}),
	schema: articleSchema,
};
