import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { DEFAULT_SEO_PARAMS } from "@const/const.ts";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
	const articles = await getCollection("articles");

	return rss({
		title: DEFAULT_SEO_PARAMS.TITLE,
		description: DEFAULT_SEO_PARAMS.DESCRIPTION,
		site: context.site ?? DEFAULT_SEO_PARAMS.SITE,
		items: articles.map((article) => ({
			title: article.data.title,
			description: article.data.description,
			pubDate: new Date(article.data.publishDate),
			link: `/articles/${article.data.slug}/`,
		})),
	});
};
