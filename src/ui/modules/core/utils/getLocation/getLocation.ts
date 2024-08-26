import { PAGES_ROUTES } from "@const/const.ts";

type PathKeys = keyof typeof PAGES_ROUTES;

export function getLocation(url: URL): PathKeys | undefined {
	return Object.keys(PAGES_ROUTES).find((key) => url.pathname.includes(PAGES_ROUTES[key as PathKeys])) as
		| PathKeys
		| undefined;
}
