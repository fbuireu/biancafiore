import { CALENDLY } from "@const/calendly";

const HTTPS_UPGRADE_DIRECTIVE = "upgrade-insecure-requests";

const CONTENT_SECURITY_POLICY_DIRECTIVES = [
	"default-src 'self'",
	`script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.gstatic.com https://unpkg.com ${CALENDLY.ASSETS_ORIGIN}`,
	`style-src 'self' 'unsafe-inline' ${CALENDLY.ASSETS_ORIGIN}`,
	"img-src 'self' data: https:",
	"font-src 'self' data:",
	"connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://www.google.com https://api.websitecarbon.com https://api.thegreenwebfoundation.org",
	"worker-src 'self' blob:",
	`frame-src 'self' https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com ${CALENDLY.BOOKING_ORIGIN}`,
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	HTTPS_UPGRADE_DIRECTIVE,
];

interface SecurityHeadersParams {
	isDevelopment?: boolean;
}

export function securityHeaders({ isDevelopment = false }: SecurityHeadersParams = {}): Record<string, string> {
	const directives = isDevelopment
		? CONTENT_SECURITY_POLICY_DIRECTIVES.filter((directive) => directive !== HTTPS_UPGRADE_DIRECTIVE)
		: CONTENT_SECURITY_POLICY_DIRECTIVES;

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

export const SECURITY_HEADERS = securityHeaders();
