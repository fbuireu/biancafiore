import { HIDE_CHROME } from "astro:env/client";
import { PAGES_ROUTES } from "@const/index";
import { isWithin } from "@modules/core/utils/pathname";

const PUBLISHED_ROUTES = [
	PAGES_ROUTES.ARTICLES,
	PAGES_ROUTES.TAGS,
	PAGES_ROUTES["TERMS-AND-CONDITIONS"],
	PAGES_ROUTES["PRIVACY-POLICY"],
	PAGES_ROUTES["404"],
	PAGES_ROUTES["500"],
] as const;

export type SiteChrome = {
	showsHeader: boolean;
	showsBreadcrumbs: boolean;
	showsTableOfContents: boolean;
	servesRealContent: boolean;
};

export function siteChrome(url: URL, isChromeHidden: boolean = HIDE_CHROME): SiteChrome {
	return {
		showsHeader: !isChromeHidden,
		showsBreadcrumbs: !isChromeHidden,
		showsTableOfContents: !isChromeHidden,
		servesRealContent: !isChromeHidden || PUBLISHED_ROUTES.some((route) => isWithin(url.pathname, route)),
	};
}
