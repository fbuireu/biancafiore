import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { DEFAULT_SEO_PARAMS } from "@const/index.js";

export async function GET(context) {
	const posts = await getCollection("articles");
	return rss({
		title: DEFAULT_SEO_PARAMS.TITLE,
		description: DEFAULT_SEO_PARAMS.DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: `/blog/${post.slug}/`,
		})),
	});
}
