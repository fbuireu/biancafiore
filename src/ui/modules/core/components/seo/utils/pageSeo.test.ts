import { SITE_URL } from "astro:env/client";
import type { SiteSettingsDTO } from "@domain/site";
import { describe, expect, it } from "vitest";
import { pageSeo } from "./pageSeo";

const SITE: SiteSettingsDTO = {
	title: "Bianca Fiore",
	description: "Bianca Fiore: personal website.",
	socialLinks: [],
	titleSeparator: " | ",
	defaultImage: { url: "/og.jpg", width: 1200, height: 630 },
};

const absolute = (path: string) => new URL(path, SITE_URL).href;

describe("pageSeo", () => {
	it("falls back to the site's title, description and share image on a page that sets none", () => {
		expect(pageSeo({ metadata: {}, site: SITE, pathname: "/" })).toStrictEqual({
			documentTitle: "Bianca Fiore",
			title: "Bianca Fiore",
			description: "Bianca Fiore: personal website.",
			image: absolute("/og.jpg"),
			imageWidth: 1200,
			imageHeight: 630,
			canonical: absolute("/"),
			robots: "index, follow",
			type: "website",
			tags: [],
			siteName: "Bianca Fiore",
			locale: "en_GB",
		});
	});

	it("suffixes the site's title to a page's own, joined by the editor's separator", () => {
		expect(pageSeo({ metadata: { title: "Projects" }, site: SITE, pathname: "/projects" }).documentTitle).toBe(
			"Projects | Bianca Fiore",
		);
	});

	it("drops the default image's dimensions when the page brings an image of its own", () => {
		const seo = pageSeo({ metadata: { image: "/card.jpg" }, site: SITE, pathname: "/" });

		expect(seo.image).toBe(absolute("/card.jpg"));
		expect(seo).not.toHaveProperty("imageWidth");
	});

	it("keeps the legal pages out of the index unless the page says otherwise", () => {
		expect(pageSeo({ metadata: {}, site: SITE, pathname: "/privacy-policy" }).robots).toBe("noindex, nofollow");
		expect(
			pageSeo({ metadata: { robots: { index: false, follow: false } }, site: SITE, pathname: "/articles/x" }).robots,
		).toBe("noindex, nofollow");
	});

	it("carries an Article's dates, author and tags", () => {
		const seo = pageSeo({
			metadata: { type: "article", publishedTime: "2024-01-01", author: "Bianca Fiore", tags: ["Craft"] },
			site: SITE,
			pathname: "/articles/x",
		});

		expect(seo).toMatchObject({
			type: "article",
			publishedTime: "2024-01-01",
			author: "Bianca Fiore",
			tags: ["Craft"],
		});
		expect(seo).not.toHaveProperty("modifiedTime");
	});
});
