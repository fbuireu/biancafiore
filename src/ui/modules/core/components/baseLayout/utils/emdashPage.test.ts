import { describe, expect, it } from "vitest";
import type { Seo } from "../../seo/utils/pageSeo";
import { emdashPageFields } from "./emdashPage";

const WEBSITE: Seo = {
	documentTitle: "Projects | Bianca Fiore",
	title: "Projects",
	description: "What she works on.",
	image: "https://biancafiore.me/card.jpg",
	canonical: "https://biancafiore.me/projects",
	robots: "index, follow",
	type: "website",
	tags: [],
	siteName: "Bianca Fiore",
	locale: "en_GB",
};

describe("emdashPageFields", () => {
	it("hands EmDash no canonical and no site name, so it adds no JSON-LD beside the site's own", () => {
		const fields = emdashPageFields(WEBSITE);

		expect(fields).not.toHaveProperty("canonical");
		expect(fields).not.toHaveProperty("siteName");
	});

	it("hands EmDash the values it renders the shared head tags from", () => {
		expect(emdashPageFields(WEBSITE)).toStrictEqual({
			kind: "custom",
			pageType: "website",
			title: "Projects",
			pageTitle: "Projects",
			description: "What she works on.",
			image: "https://biancafiore.me/card.jpg",
			seo: { robots: "index, follow" },
		});
	});

	it("carries an Article's dates and author, which only an article page has", () => {
		const fields = emdashPageFields({
			...WEBSITE,
			type: "article",
			publishedTime: "2024-01-01T00:00:00.000Z",
			author: "Bianca Fiore",
		});

		expect(fields.pageType).toBe("article");
		expect(fields.articleMeta).toStrictEqual({
			publishedTime: "2024-01-01T00:00:00.000Z",
			modifiedTime: null,
			author: "Bianca Fiore",
		});
	});
});
