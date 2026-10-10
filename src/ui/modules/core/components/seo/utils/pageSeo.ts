import { DEFAULT_LOCALE_STRING } from "@const/locale";
import { isNoindexRoute } from "@const/noindexRoutes";
import { absoluteUrl } from "@const/routes";
import type { SeoMetadata } from "@const/types";
import type { SiteSettingsDTO } from "@domain/site";
import { INDEX_ROBOTS, NOINDEX_ROBOTS } from "../const";
import { openGraphLocale } from "./locale";

export interface Seo {
	documentTitle: string;
	title: string;
	description: string;
	image: string;
	imageWidth?: number;
	imageHeight?: number;
	canonical: string;
	robots: string;
	type: "website" | "article";
	publishedTime?: string;
	modifiedTime?: string;
	author?: string;
	tags: string[];
	siteName: string;
	locale: string;
}

interface PageSeoParams {
	metadata: Partial<SeoMetadata>;
	site: SiteSettingsDTO;
	pathname: string;
}

export function pageSeo({ metadata, site, pathname }: PageSeoParams): Seo {
	const title = metadata.title ?? site.title;
	const image = metadata.image
		? { url: metadata.image, width: metadata.imageWidth, height: metadata.imageHeight }
		: site.defaultImage;
	const robots = metadata.robots ?? (isNoindexRoute(pathname) ? NOINDEX_ROBOTS : INDEX_ROBOTS);

	return {
		documentTitle: title === site.title ? site.title : `${title}${site.titleSeparator}${site.title}`,
		title,
		description: metadata.description ?? site.description,
		image: absoluteUrl(image.url),
		...(image.width && { imageWidth: image.width }),
		...(image.height && { imageHeight: image.height }),
		canonical: absoluteUrl(pathname),
		robots: `${robots.index ? "index" : "noindex"}, ${robots.follow ? "follow" : "nofollow"}`,
		type: metadata.type ?? "website",
		...(metadata.publishedTime && { publishedTime: metadata.publishedTime }),
		...(metadata.modifiedTime && { modifiedTime: metadata.modifiedTime }),
		...(metadata.author && { author: metadata.author }),
		tags: metadata.tags ?? [],
		siteName: site.title,
		locale: openGraphLocale(DEFAULT_LOCALE_STRING),
	};
}
