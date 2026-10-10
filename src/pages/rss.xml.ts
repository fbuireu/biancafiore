import rss from "@astrojs/rss";
import { absoluteUrl, articleHref, PAGES_ROUTES } from "@const/index";
import { sortReverseChronological } from "@domain/article/rules";
import { readArticles, readSiteSettings } from "@modules/core/utils/entries";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ isPrerendered }) => {
	const [articles, site] = await Promise.all([readArticles(), readSiteSettings(isPrerendered)]);

	return rss({
		title: site.title,
		description: site.description,
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
