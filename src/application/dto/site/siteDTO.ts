import { SITE_DEFAULTS } from "@const/site";
import { webUrlSchema } from "@domain/shared/url";
import type { SiteSettingsDTO } from "@domain/site";
import { isSafeImageUrl, isWebUrl } from "../shared/urls";
import type { RawSiteSettings } from "./types";

const textOf = (value: string | null): string | undefined => value?.trim() || undefined;

function socialLinksOf(social: RawSiteSettings["social"]): SiteSettingsDTO["socialLinks"] {
	const networks = Object.entries(social).flatMap(([name, url]) => {
		const trimmed = url.trim();

		return isWebUrl(trimmed) ? [{ name, url: trimmed }] : [];
	});

	return networks.length > 0
		? networks
		: SITE_DEFAULTS.SOCIAL_LINKS.map(({ name, url }) => ({ name, url: webUrlSchema.parse(url) }));
}

function defaultImageOf(image: RawSiteSettings["defaultOgImage"]): SiteSettingsDTO["defaultImage"] {
	return image && isSafeImageUrl(image.src)
		? { url: image.src, width: image.width, height: image.height }
		: { url: SITE_DEFAULTS.IMAGE };
}

export function createSiteSettings(raw: RawSiteSettings): SiteSettingsDTO {
	return {
		title: textOf(raw.title) ?? SITE_DEFAULTS.TITLE,
		description: textOf(raw.tagline) ?? SITE_DEFAULTS.DESCRIPTION,
		socialLinks: socialLinksOf(raw.social),
		titleSeparator: raw.titleSeparator ?? SITE_DEFAULTS.TITLE_SEPARATOR,
		defaultImage: defaultImageOf(raw.defaultOgImage),
	};
}

export function createDefaultSiteSettings(): SiteSettingsDTO {
	return createSiteSettings({
		title: null,
		tagline: null,
		social: {},
		titleSeparator: null,
	});
}
