import { articleDTO } from "@application/dto/article";
import type { RawArticle } from "@application/dto/article/types.ts";
import rss from "@astrojs/rss";
import { DEFAULT_SEO_PARAMS } from "@const/const.ts";
import { client } from "@infrastructure/cms/client.ts";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
	const { items: rawArticles } = await client.getEntries<RawArticle>({
		content_type: "article",
		order: ["-fields.publishDate"],
	});

	const articles = articleDTO.render(rawArticles as unknown as RawArticle[]);

	return rss({
		title: DEFAULT_SEO_PARAMS.TITLE,
		description: DEFAULT_SEO_PARAMS.DESCRIPTION,
		site: context.site ?? DEFAULT_SEO_PARAMS.SITE,
		items: articles.map((article) => ({
			title: article.title,
			description: article.description,
			pubDate: new Date(article.publishDate),
			link: `/articles/${article.slug}/`,
		})),
	});
};
