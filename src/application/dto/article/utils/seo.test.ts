import { describe, expect, it } from "vitest";
import { articleSeo } from "./seo";

const EMPTY = { title: null, description: null, image: null, noIndex: false };
const FEATURED = {
	url: "/_emdash/api/media/file/hero.jpg",
	alt: "",
	details: { width: 1600, height: 900 },
} as unknown as Parameters<typeof articleSeo>[0]["featuredImage"];
const DERIVED = { title: "The Article", description: "Its description.", featuredImage: FEATURED };
const INDEX = { index: true, follow: true };

describe("articleSeo", () => {
	it("derives every value from the Article when the editor left the SEO panel untouched", () => {
		expect(articleSeo({ raw: undefined, ...DERIVED })).toEqual({
			title: "The Article",
			description: "Its description.",
			image: "/_emdash/api/media/file/hero.jpg",
			imageWidth: 1600,
			imageHeight: 900,
			robots: INDEX,
		});
		expect(articleSeo({ raw: { ...EMPTY, title: "   " }, ...DERIVED }).title).toBe("The Article");
	});

	it("leaves the image out when the Article has none and the editor set none", () => {
		expect(articleSeo({ raw: EMPTY, ...DERIVED, featuredImage: undefined })).not.toHaveProperty("image");
	});

	it("takes the title and description the editor wrote, trimmed", () => {
		expect(
			articleSeo({ raw: { ...EMPTY, title: " A sharper title ", description: "A better pitch." }, ...DERIVED }),
		).toMatchObject({ title: "A sharper title", description: "A better pitch." });
	});

	it("takes the editor's image without the featured image's dimensions, which describe another picture", () => {
		const seo = articleSeo({ raw: { ...EMPTY, image: "https://cdn.example/card.jpg" }, ...DERIVED });

		expect(seo.image).toBe("https://cdn.example/card.jpg");
		expect(seo).not.toHaveProperty("imageWidth");
		expect(seo).not.toHaveProperty("imageHeight");
	});

	it("points a bare media reference at EmDash's media route, as EmDash itself does", () => {
		expect(articleSeo({ raw: { ...EMPTY, image: "01KS123.jpg" }, ...DERIVED }).image).toBe(
			"/_emdash/api/media/file/01KS123.jpg",
		);
	});

	it("falls back to the featured image when the editor's image would leave the site unsafely", () => {
		expect(articleSeo({ raw: { ...EMPTY, image: "//evil.example/x.jpg" }, ...DERIVED }).image).toBe(FEATURED?.url);
		expect(articleSeo({ raw: { ...EMPTY, image: "javascript:alert(1)" }, ...DERIVED }).image).toBe(FEATURED?.url);
	});

	it("turns the editor's noindex into the robots directive", () => {
		expect(articleSeo({ raw: { ...EMPTY, noIndex: true }, ...DERIVED }).robots).toEqual({
			index: false,
			follow: false,
		});
	});
});
