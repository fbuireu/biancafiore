import { type ArticleEntry, readArticles } from "./entries";
import { buildArticleListSchema } from "./jsonLd";

interface BlogPreview {
	articles: ArticleEntry[];
	itemListSchema: ReturnType<typeof buildArticleListSchema>;
}

export async function blogPreview(limit: number): Promise<BlogPreview> {
	const articles = (await readArticles()).slice(0, limit);

	return { articles, itemListSchema: buildArticleListSchema(articles.map(({ data }) => data.slug)) };
}
