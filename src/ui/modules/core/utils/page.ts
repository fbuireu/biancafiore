import { PAGES_ROUTES } from "@const/index";
import { isWithin } from "@modules/core/utils/pathname";

type GetPageReturn = Lowercase<keyof typeof PAGES_ROUTES> | undefined;

export function getPage(url: URL): GetPageReturn {
	return Object.keys(PAGES_ROUTES)
		.find((key) => isWithin(url.pathname, PAGES_ROUTES[key as keyof typeof PAGES_ROUTES]))
		?.toLowerCase() as GetPageReturn;
}
