import { describe, expect, it } from "vitest";
import { buildSitemap } from "./sitemap";

const HEADER = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

describe("buildSitemap", () => {
	it("lists every url it was given in order, with a last modification only where one is known", () => {
		expect(
			buildSitemap([
				{ location: "https://biancafiore.me/" },
				{ location: "https://biancafiore.me/articles/a-piece", lastModified: "2026-01-02T00:00:00.000Z" },
			]),
		).toBe(
			`${HEADER}<url><loc>https://biancafiore.me/</loc></url><url><loc>https://biancafiore.me/articles/a-piece</loc><lastmod>2026-01-02T00:00:00.000Z</lastmod></url></urlset>`,
		);
	});

	it("escapes a location, so a slug carrying an ampersand cannot break the document", () => {
		expect(buildSitemap([{ location: "https://biancafiore.me/tags/rock&roll" }])).toContain(
			"<loc>https://biancafiore.me/tags/rock&amp;roll</loc>",
		);
	});

	it("answers a valid, empty document when there is nothing to list", () => {
		expect(buildSitemap([])).toBe(`${HEADER}</urlset>`);
	});
});
