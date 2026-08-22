import { defineMiddleware } from "astro:middleware";
import { securityHeaders } from "@const/securityHeaders";

const PRODUCTION_HEADERS = Object.entries(securityHeaders());
const DEVELOPMENT_HEADERS = Object.entries(securityHeaders({ isDevelopment: true }));

export const onRequest = defineMiddleware(async (_, next) => {
	const response = await next();

	for (const [header, value] of import.meta.env.DEV ? DEVELOPMENT_HEADERS : PRODUCTION_HEADERS) {
		response.headers.set(header, value);
	}

	return response;
});
