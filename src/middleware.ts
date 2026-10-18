import { GOOGLE_ANALYTICS_ID } from "astro:env/client";
import { defineMiddleware } from "astro:middleware";
import { CONTENT_BROWSER_CACHE_CONTROL, CONTENT_ROUTES } from "@const/contentCache";
import { securityHeaders } from "@const/securityHeaders";
import { inlineScriptHashes } from "@modules/core/utils/inlineScripts";

const HEADERS = Object.entries(
	securityHeaders({ isDevelopment: import.meta.env.DEV, inlineScriptHashes: inlineScriptHashes(GOOGLE_ANALYTICS_ID) }),
);

const CONTENT_ROUTE_PATTERNS = new Set<string>(CONTENT_ROUTES);

const EMDASH_ROUTES = "/_emdash/";

export const onRequest = defineMiddleware(async ({ url, routePattern }, next) => {
	const response = await next();

	if (url.pathname.startsWith(EMDASH_ROUTES)) return response;

	for (const [header, value] of HEADERS) {
		response.headers.set(header, value);
	}

	if (response.status === 200 && CONTENT_ROUTE_PATTERNS.has(routePattern)) {
		response.headers.set("Cache-Control", CONTENT_BROWSER_CACHE_CONTROL);
	}

	return response;
});
