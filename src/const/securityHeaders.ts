import { CALENDLY } from "./calendly";

const HTTPS_UPGRADE_DIRECTIVE = "upgrade-insecure-requests";

const SCRIPT_ORIGINS = `https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.gstatic.com https://betterstack.net https://static.cloudflareinsights.com ${CALENDLY.ASSETS_ORIGIN}`;

interface SecurityHeadersParams {
	isDevelopment: boolean;
	inlineScriptHashes: readonly string[];
}

export function securityHeaders({ isDevelopment, inlineScriptHashes }: SecurityHeadersParams): Record<string, string> {
	const inlineScripts = isDevelopment ? ["'unsafe-inline'"] : inlineScriptHashes.map((hash) => `'sha256-${hash}'`);

	const directives = [
		"default-src 'self'",
		`script-src ${["'self'", ...inlineScripts, SCRIPT_ORIGINS].join(" ")}`,
		`style-src 'self' 'unsafe-inline' https://fonts.googleapis.com ${CALENDLY.ASSETS_ORIGIN}`,
		"img-src 'self' data: https:",
		"font-src 'self' data: https://fonts.gstatic.com",
		"connect-src 'self' https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://www.google.com https://api.websitecarbon.com https://api.thegreenwebfoundation.org https://betterstack.net https://*.betterstackdata.com https://cloudflareinsights.com",
		"worker-src 'self' blob:",
		`frame-src 'self' https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com ${CALENDLY.BOOKING_ORIGIN}`,
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		...(isDevelopment ? [] : [HTTPS_UPGRADE_DIRECTIVE]),
	];

	return {
		"Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
		"X-Content-Type-Options": "nosniff",
		"X-Frame-Options": "SAMEORIGIN",
		"Referrer-Policy": "strict-origin-when-cross-origin",
		"Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
		"Cross-Origin-Opener-Policy": "same-origin-allow-popups",
		"Cross-Origin-Resource-Policy": "cross-origin",
		"Content-Security-Policy": directives.join("; "),
	};
}
