import { GOOGLE_ANALYTICS_ID } from "astro:env/client";
import { defineMiddleware } from "astro:middleware";
import { securityHeaders } from "@const/securityHeaders";
import { inlineScriptHashes } from "@modules/core/utils/inlineScripts";

const INLINE_SCRIPT_HASHES = inlineScriptHashes(GOOGLE_ANALYTICS_ID);
const PRODUCTION_HEADERS = Object.entries(
	securityHeaders({ isDevelopment: false, inlineScriptHashes: INLINE_SCRIPT_HASHES }),
);
const DEVELOPMENT_HEADERS = Object.entries(
	securityHeaders({ isDevelopment: true, inlineScriptHashes: INLINE_SCRIPT_HASHES }),
);

const EMDASH_ROUTES = "/_emdash/";

export const onRequest = defineMiddleware(async ({ url }, next) => {
	const response = await next();

	if (url.pathname.startsWith(EMDASH_ROUTES)) return response;

	for (const [header, value] of import.meta.env.DEV ? DEVELOPMENT_HEADERS : PRODUCTION_HEADERS) {
		response.headers.set(header, value);
	}

	return response;
});
