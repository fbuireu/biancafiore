import { defineMiddleware } from "astro:middleware";
import { SECURITY_HEADERS } from "@const/securityHeaders";

export const onRequest = defineMiddleware(async (_, next) => {
	const response = await next();

	for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(header, value);
	}

	return response;
});
