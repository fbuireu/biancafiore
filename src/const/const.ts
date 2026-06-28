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
	HOME: "/",
} as const;

export const CONTACT_DETAILS = {
	NAME: "Bianca Fiore",
	EMAIL_SUBJECT: "Web contact form submission",
	ENCODED_EMAIL_FROM: btoa("hello@biancafiore.me"),
	ENCODED_EMAIL_BIANCA: btoa(BIANCA_EMAIL),
} as const;

export const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
	weekday: "long",
	year: "numeric",
	month: "long",
	day: "numeric",
};

export const DEFAULT_LOCALE_STRING: Intl.LocalesArgument = "en-GB" as const;
