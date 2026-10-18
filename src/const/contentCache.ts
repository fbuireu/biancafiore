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

interface RouteCacheRule {
	maxAge: number;
	swr: number;
}

interface ContentCacheRule extends RouteCacheRule {
	tags: string[];
}

export const CONTENT_CACHE: ContentCacheRule = {
	maxAge: 86_400,
	swr: 3_600,
	tags: [...CONTENT_CACHE_TAGS],
};

export const IMAGE_ROUTE = "/_image";

export const IMAGE_CACHE: RouteCacheRule = {
	maxAge: CONTENT_CACHE.maxAge,
	swr: CONTENT_CACHE.swr,
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
] as const;
