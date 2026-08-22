const TRAILING_SLASH = /\/$/;

export interface IsWithinParams {
	pathname: string;
	route: string;
}

export function isWithin({ pathname, route }: IsWithinParams): boolean {
	const withoutTrailingSlash = pathname.length > 1 ? pathname.replace(TRAILING_SLASH, "") : pathname;

	if (route === "/") return withoutTrailingSlash === "/";
	if (route.endsWith("/")) return withoutTrailingSlash.startsWith(route) && withoutTrailingSlash !== route;

	return withoutTrailingSlash === route || withoutTrailingSlash.startsWith(`${route}/`);
}
