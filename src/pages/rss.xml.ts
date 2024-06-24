import { getCollection } from "astro:content";
import { articleDTO } from "@application/dto/article";
import rss from "@astrojs/rss";
import { DEFAULT_SEO_PARAMS } from "@const/const.ts";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
	const articles = await Promise.all((await getCollection("articles")).map(articleDTO.render));

	return rss({
		title: DEFAULT_SEO_PARAMS.TITLE,
		description: DEFAULT_SEO_PARAMS.DESCRIPTION,
		site: context.site ?? DEFAULT_SEO_PARAMS.SITE,
		items: articles.map((article) => ({
			title: article.data.title,
			description: article.data.description,
			pubDate: article.data.publishDate,
			link: `/articles/${article.slug}/`,
		})),
	});
};
