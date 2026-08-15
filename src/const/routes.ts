import { SITE_URL } from "astro:env/client";
import { PAGES_ROUTES } from "./const";

export function articleHref(slug: string): string {
	return `${PAGES_ROUTES.ARTICLE}${slug}`;
}

export function tagHref(slug: string): string {
	return `${PAGES_ROUTES.TAG}${slug}`;
}

export function projectHref(id: string): string {
	return `${PAGES_ROUTES.PROJECTS}#${id}`;
}

export function isTagPath(pathname: string): boolean {
	return pathname.startsWith(PAGES_ROUTES.TAG) && pathname !== PAGES_ROUTES.TAG;
}

export function absoluteUrl(path: string): string {
	return new URL(path, SITE_URL).href;
}
