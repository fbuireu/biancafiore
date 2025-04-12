import { PAGES_ROUTES } from "@const/index";

type GetLocationReturn = Lowercase<keyof typeof PAGES_ROUTES> | undefined;

export function getLocation(url: URL): GetLocationReturn {
	return Object.keys(PAGES_ROUTES)
		.find((key) => url.pathname.includes(PAGES_ROUTES[key as keyof typeof PAGES_ROUTES]))
		?.toLowerCase() as GetLocationReturn;
}
