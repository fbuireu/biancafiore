import type { CollectionEntry } from "astro:content";
import { partitionFeatured } from "@modules/articles/utils/featured";
import { describe, expect, it } from "vitest";

interface MakeArticleParams {
	slug: string;
	isFeaturedArticle?: boolean;
	hasImage?: boolean;
}

const makeArticle = ({ slug, isFeaturedArticle = false, hasImage = true }: MakeArticleParams) =>
	({
		data: {
			slug,
			isFeaturedArticle,
			...(hasImage && { featuredImage: { url: `https://cdn/${slug}.jpg` } }),
		},
	}) as unknown as CollectionEntry<"articles">;

const slugsOf = (articles: CollectionEntry<"articles">[]) => articles.map(({ data }) => data.slug);

describe("partitionFeatured", () => {
	it("takes the first article flagged as featured that also carries a cover image", () => {
		const { featured } = partitionFeatured([
			makeArticle({ slug: "plain" }),
			makeArticle({ slug: "flagged-no-image", isFeaturedArticle: true, hasImage: false }),
			makeArticle({ slug: "the-hero", isFeaturedArticle: true }),
			makeArticle({ slug: "also-flagged", isFeaturedArticle: true }),
		]);

		expect(featured?.data.slug).toBe("the-hero");
	});

	it("falls back to the first article with a cover image when none is flagged", () => {
		const { featured } = partitionFeatured([
			makeArticle({ slug: "no-image", hasImage: false }),
			makeArticle({ slug: "first-illustrated" }),
			makeArticle({ slug: "second-illustrated" }),
		]);

		expect(featured?.data.slug).toBe("first-illustrated");
	});

	it("follows the order it was given, which is the Blog's own Favorite-first order", () => {
		const { featured } = partitionFeatured([makeArticle({ slug: "newest" }), makeArticle({ slug: "older" })]);

		expect(featured?.data.slug).toBe("newest");
	});

	it("names no hero when not one article carries a cover image", () => {
		const { featured, rest } = partitionFeatured([
			makeArticle({ slug: "a", hasImage: false }),
			makeArticle({ slug: "b", isFeaturedArticle: true, hasImage: false }),
		]);

		expect(featured).toBeUndefined();
		expect(slugsOf(rest)).toEqual(["a", "b"]);
	});

	it("keeps the hero out of the rest, so the listing never shows it twice", () => {
		const { rest } = partitionFeatured([
			makeArticle({ slug: "the-hero", isFeaturedArticle: true }),
			makeArticle({ slug: "second" }),
			makeArticle({ slug: "third" }),
		]);

		expect(slugsOf(rest)).toEqual(["second", "third"]);
	});

	it("answers an empty listing and no hero for an empty Blog", () => {
		expect(partitionFeatured([])).toEqual({ featured: undefined, rest: [] });
	});
});
