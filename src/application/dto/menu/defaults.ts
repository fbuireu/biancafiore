import { PAGES_ROUTES } from "@const/index";
import { MENU_NAME, type MenuItemDTO, type MenuName } from "@domain/menu";

export const DEFAULT_MENU_ITEMS: Record<MenuName, MenuItemDTO[]> = {
	[MENU_NAME.HEADER]: [
		{ before: "back to start", label: "Home", href: PAGES_ROUTES.HOME, opensInNewTab: false },
		{ label: "Projects", after: "I worked on", href: PAGES_ROUTES.PROJECTS, opensInNewTab: false },
		{ before: "my", label: "Articles", href: PAGES_ROUTES.ARTICLES, opensInNewTab: false },
		{ before: "know more", label: "About", after: "me", href: PAGES_ROUTES.ABOUT, opensInNewTab: false },
		{ label: "Contact", after: "me", href: PAGES_ROUTES.CONTACT, opensInNewTab: false },
	],
	[MENU_NAME.FOOTER]: [
		{ label: "Terms and Conditions", href: PAGES_ROUTES["TERMS-AND-CONDITIONS"], opensInNewTab: false },
		{ label: "Privacy Policy", href: PAGES_ROUTES["PRIVACY-POLICY"], opensInNewTab: false },
	],
};
