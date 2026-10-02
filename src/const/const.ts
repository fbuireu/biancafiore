import { BIANCA_EMAIL } from "astro:env/client";

export const PAGES_ROUTES = {
	ARTICLE: "/articles/",
	ARTICLES: "/articles",
	ABOUT: "/about",
	TAGS: "/tags",
	TAG: "/tags/",
	CONTACT: "/contact",
	PROJECTS: "/projects",
	"TERMS-AND-CONDITIONS": "/terms-and-conditions",
	"PRIVACY-POLICY": "/privacy-policy",
	"404": "/404",
	"500": "/500",
	HOME: "/",
} as const;
export const SITE_AUTHOR_SLUG = "bianca-fiore" as const;
export const CONTACT_DETAILS = {
	NAME: "Bianca Fiore",
	EMAIL_SUBJECT: "Web contact form submission",
	ENCODED_EMAIL_FROM: btoa("hello@biancafiore.me"),
	ENCODED_EMAIL_BIANCA: btoa(BIANCA_EMAIL),
} as const;

export type { ImageCdn } from "./imageCdn";
export { IMAGE_CDN } from "./imageCdn";
export { DEFAULT_DATE_FORMAT, DEFAULT_LOCALE_STRING } from "./locale";
