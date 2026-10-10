import { GOOGLE_ANALYTICS_ID } from "astro:env/client";
import { defineMiddleware } from "astro:middleware";
import { securityHeaders } from "@const/securityHeaders";
import { inlineScriptHashes } from "@modules/core/utils/inlineScripts";

const HEADERS = Object.entries(
	securityHeaders({ isDevelopment: import.meta.env.DEV, inlineScriptHashes: inlineScriptHashes(GOOGLE_ANALYTICS_ID) }),
);

const EMDASH_ROUTES = "/_emdash/";

export const onRequest = defineMiddleware(async ({ url }, next) => {
	const response = await next();

	if (url.pathname.startsWith(EMDASH_ROUTES)) return response;

	for (const [header, value] of HEADERS) {
		response.headers.set(header, value);
	}

	return response;
});
