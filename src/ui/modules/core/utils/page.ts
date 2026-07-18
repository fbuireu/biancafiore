import { PAGES_ROUTES } from "@const/index";

type GetPageReturn = Lowercase<keyof typeof PAGES_ROUTES> | undefined;

export function getPage(url: URL): GetPageReturn {
	return Object.keys(PAGES_ROUTES)
		.find((key) => {
			const route = PAGES_ROUTES[key as keyof typeof PAGES_ROUTES];
			return route === "/" ? url.pathname === "/" : url.pathname.includes(route);
		})
		?.toLowerCase() as GetPageReturn;
}
