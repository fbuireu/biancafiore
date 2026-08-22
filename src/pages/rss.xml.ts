import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { absoluteUrl, articleHref, PAGES_ROUTES } from "@const/index";
import { DEFAULT_SEO_PARAMS } from "@modules/core/components/seo/const";
import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = async () => {
	const articles = await getCollection("articles");

	return rss({
		title: DEFAULT_SEO_PARAMS.title,
		description: DEFAULT_SEO_PARAMS.description,
		site: absoluteUrl(PAGES_ROUTES.HOME),
		items: articles
			.map((article) => ({
				title: article.data.title,
				description: article.data.description,
				pubDate: new Date(article.data.publishDateISO),
				link: articleHref(article.data.slug),
			}))
			.toSorted((a, b) => b.pubDate.getTime() - a.pubDate.getTime()),
	});
};
