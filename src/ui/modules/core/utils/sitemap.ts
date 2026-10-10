import { escapeHtml } from "@shared/utils/strings";

interface SitemapUrl {
	location: string;
	lastModified?: string;
}

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const URLSET_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9";

const urlOf = ({ location, lastModified }: SitemapUrl): string =>
	`<url><loc>${escapeHtml(location)}</loc>${lastModified ? `<lastmod>${escapeHtml(lastModified)}</lastmod>` : ""}</url>`;

export function buildSitemap(urls: SitemapUrl[]): string {
	return `${XML_HEADER}<urlset xmlns="${URLSET_NAMESPACE}">${urls.map(urlOf).join("")}</urlset>`;
}
