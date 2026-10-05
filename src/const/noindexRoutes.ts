export const TERMS_AND_CONDITIONS_ROUTE = "/terms-and-conditions";
export const PRIVACY_POLICY_ROUTE = "/privacy-policy";

export const NOINDEX_ROUTES = [TERMS_AND_CONDITIONS_ROUTE, PRIVACY_POLICY_ROUTE] as const;

export function isNoindexRoute(pathname: string): boolean {
	return NOINDEX_ROUTES.some((route) => pathname === route || pathname === `${route}/`);
}
