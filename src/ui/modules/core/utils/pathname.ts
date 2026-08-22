export function isWithin(pathname: string, route: string): boolean {
	if (route === "/") return pathname === "/";
	if (route.endsWith("/")) return pathname.startsWith(route) && pathname !== route;

	return pathname === route || pathname.startsWith(`${route}/`);
}
