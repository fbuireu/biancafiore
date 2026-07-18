import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { DEFAULT_SEO_PARAMS } from "@modules/core/components/seo/const";
import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = async (context) => {
	const articles = await getCollection("articles");

	return rss({
		title: DEFAULT_SEO_PARAMS.title,
		description: DEFAULT_SEO_PARAMS.description,
		site: context.site ?? DEFAULT_SEO_PARAMS.site,
		items: articles.map((article) => ({
			title: article.data.title,
			description: article.data.description,
			pubDate: new Date(article.data.publishDateISO),
			link: `/articles/${article.data.slug}`,
		})),
	});
};
