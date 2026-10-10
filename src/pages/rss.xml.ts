import rss from "@astrojs/rss";
import { absoluteUrl, articleHref, PAGES_ROUTES } from "@const/index";
import { sortReverseChronological } from "@domain/article/rules";
import { DEFAULT_SEO_PARAMS } from "@modules/core/components/seo/const";
import { readArticles } from "@modules/core/utils/entries";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
	const articles = await readArticles();

	return rss({
		title: DEFAULT_SEO_PARAMS.title,
		description: DEFAULT_SEO_PARAMS.description,
		site: absoluteUrl(PAGES_ROUTES.HOME),
		trailingSlash: false,
		items: sortReverseChronological(articles.map(({ data }) => data)).map((article) => ({
			title: article.title,
			description: article.description,
			pubDate: new Date(article.publishDateISO),
			link: articleHref(article.slug),
		})),
	});
};
