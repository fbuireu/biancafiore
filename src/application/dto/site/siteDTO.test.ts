import { SITE_DEFAULTS } from "@const/site";
import { describe, expect, it } from "vitest";
import { createSiteSettings } from "./siteDTO";

const UNSET = {
	title: null,
	tagline: null,
	social: {},
	titleSeparator: null,
};

const RAW = {
	...UNSET,
	title: "  Bianca ",
	tagline: "Words, mostly.",
	social: { linkedin: "https://www.linkedin.com/in/bianca", twitter: "javascript:alert(1)", github: "//evil.example" },
	titleSeparator: " — ",
	defaultOgImage: { src: "/_emdash/api/media/file/card.jpg", width: 1200, height: 630 },
};

describe("createSiteSettings", () => {
	it("hands back today's site on a database nobody has configured, every value ready to render", () => {
		expect(createSiteSettings(UNSET)).toEqual({
			title: SITE_DEFAULTS.TITLE,
			description: SITE_DEFAULTS.DESCRIPTION,
			socialLinks: SITE_DEFAULTS.SOCIAL_LINKS,
			titleSeparator: SITE_DEFAULTS.TITLE_SEPARATOR,
			defaultImage: { url: SITE_DEFAULTS.IMAGE },
		});
	});

	it("reads the title and the tagline as the site's name and description, trimmed", () => {
		expect(createSiteSettings(RAW)).toMatchObject({ title: "Bianca", description: "Words, mostly." });
	});

	it("falls back value by value, so a half-filled settings page still renders whole", () => {
		expect(createSiteSettings({ ...UNSET, title: "Bianca", tagline: "   " })).toMatchObject({
			title: "Bianca",
			description: SITE_DEFAULTS.DESCRIPTION,
			defaultImage: { url: SITE_DEFAULTS.IMAGE },
		});
	});

	it("keeps only the social networks whose value is an http(s) URL, named after their key", () => {
		expect(createSiteSettings(RAW).socialLinks).toEqual([
			{ name: "linkedin", url: "https://www.linkedin.com/in/bianca" },
		]);
	});

	it("falls back to the site's own networks when none of the editor's is a usable URL", () => {
		expect(createSiteSettings({ ...UNSET, social: { twitter: "@bianca" } }).socialLinks).toEqual(
			SITE_DEFAULTS.SOCIAL_LINKS,
		);
	});

	it("carries the default share image, and the separator the editor set", () => {
		expect(createSiteSettings(RAW)).toMatchObject({
			titleSeparator: " — ",
			defaultImage: { url: "/_emdash/api/media/file/card.jpg", width: 1200, height: 630 },
		});
	});

	it("replaces a default image whose URL is neither on this origin nor http(s) with the site's own", () => {
		expect(createSiteSettings({ ...RAW, defaultOgImage: { src: "//evil.example/card.jpg" } }).defaultImage).toEqual({
			url: SITE_DEFAULTS.IMAGE,
		});
	});
});
