import { defineMiddleware } from "astro:middleware";
import { securityHeaders } from "@const/securityHeaders";

export const onRequest = defineMiddleware(async (_, next) => {
	const response = await next();

	for (const [header, value] of Object.entries(securityHeaders({ isDevelopment: import.meta.env.DEV }))) {
		response.headers.set(header, value);
	}

	return response;
});
