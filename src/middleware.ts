import { defineMiddleware } from "astro:middleware";
import { SECURITY_HEADERS } from "@const/securityHeaders";

const CONTENT_SECURITY_POLICY = "Content-Security-Policy";
const HTTPS_UPGRADE_DIRECTIVE = "; upgrade-insecure-requests";

interface ForEnvironmentParams {
	header: string;
	value: string;
}

function forEnvironment({ header, value }: ForEnvironmentParams): string {
	if (!import.meta.env.DEV || header !== CONTENT_SECURITY_POLICY) return value;

	return value.replace(HTTPS_UPGRADE_DIRECTIVE, "");
}

export const onRequest = defineMiddleware(async (_, next) => {
	const response = await next();

	for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(header, forEnvironment({ header, value }));
	}

	return response;
});
