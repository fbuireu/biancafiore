export const BYLINES_CACHE_TAG = "bylines";

const CONTENT_CACHE_TAGS = [
	"articles",
	BYLINES_CACHE_TAG,
	"cities",
	"projects",
	"testimonials",
	"emdash:taxonomy:tag",
	"emdash:settings",
	"emdash:menu:header",
	"emdash:menu:footer",
] as const;

interface ContentCacheRule {
	maxAge: number;
	swr: number;
	tags: string[];
}

export const CONTENT_CACHE: ContentCacheRule = {
	maxAge: 86_400,
	swr: 3_600,
	tags: [...CONTENT_CACHE_TAGS],
};

export const CONTENT_ROUTES = [
	"/",
	"/about",
	"/projects",
	"/articles",
	"/articles/[...slug]",
	"/tags",
	"/tags/[slug]",
	"/rss.xml",
	"/sitemap.xml",
	"/404",
] as const;
