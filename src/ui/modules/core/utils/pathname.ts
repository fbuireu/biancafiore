export function isWithin(pathname: string, route: string): boolean {
	const withoutTrailingSlash = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;

	if (route === "/") return withoutTrailingSlash === "/";
	if (route.endsWith("/")) return withoutTrailingSlash.startsWith(route) && withoutTrailingSlash !== route;

	return withoutTrailingSlash === route || withoutTrailingSlash.startsWith(`${route}/`);
}
