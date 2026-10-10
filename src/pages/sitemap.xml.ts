import { absoluteUrl, articleHref, PAGES_ROUTES, tagHref } from "@const/index";
import { readArticles, readTags } from "@modules/core/utils/entries";
import { buildSitemap } from "@modules/core/utils/sitemap";
import type { APIRoute } from "astro";

const INDEXED_PAGES = [
	PAGES_ROUTES.HOME,
	PAGES_ROUTES.ABOUT,
	PAGES_ROUTES.PROJECTS,
	PAGES_ROUTES.ARTICLES,
	PAGES_ROUTES.TAGS,
	PAGES_ROUTES.CONTACT,
];

export const GET: APIRoute = async () => {
	const [articles, tags] = await Promise.all([readArticles(), readTags()]);

	return new Response(
		buildSitemap([
			...INDEXED_PAGES.map((page) => ({ location: absoluteUrl(page) })),
			...articles.map(({ data }) => ({ location: absoluteUrl(articleHref(data.slug)), lastModified: data.updatedAt })),
			...tags.map(({ data }) => ({ location: absoluteUrl(tagHref(data.slug)) })),
		]),
		{ headers: { "Content-Type": "application/xml; charset=utf-8" } },
	);
};
