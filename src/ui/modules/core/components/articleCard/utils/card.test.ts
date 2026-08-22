import type { CollectionEntry } from "astro:content";
import { toArticleCardContent } from "@modules/core/components/articleCard/utils/card";
import { describe, expect, it } from "vitest";

const tag = (name: string) => ({ slug: name.toLowerCase(), name });

const makeArticle = (data: Record<string, unknown> = {}) =>
	({
		data: {
			slug: "a-piece",
			title: "A piece",
			description: "About something",
			publishDate: "Friday, 15 March 2024",
			publishDateISO: "2024-03-15T00:00:00.000Z",
			readingTime: 4,
			author: { slug: "bianca-fiore", name: "Bianca Fiore", description: "Writes" },
			content: "<p>the entire rendered body</p>",
			...data,
		},
	}) as unknown as CollectionEntry<"articles">;

describe("toArticleCardContent", () => {
	it("carries only what the card renders, not the entry the page happened to have", () => {
		expect(Object.keys(toArticleCardContent(makeArticle())).toSorted()).toStrictEqual([
			"author",
			"description",
			"featuredImage",
			"publishDate",
			"publishDateISO",
			"readingTime",
			"remainingTags",
			"slug",
			"title",
			"visibleTags",
		]);
	});

	it("leaves the rendered article body behind, which is the largest thing on the entry", () => {
		expect(toArticleCardContent(makeArticle())).not.toHaveProperty("content");
	});

	it("takes the Byline down to the slug it links to and the name it prints", () => {
		expect(toArticleCardContent(makeArticle()).author).toStrictEqual({
			slug: "bianca-fiore",
			name: "Bianca Fiore",
		});
	});

	it("shows the first four tags and counts the rest, so a busy Article does not overflow its card", () => {
		const { visibleTags, remainingTags } = toArticleCardContent(
			makeArticle({ tags: ["one", "two", "three", "four", "five", "six"].map(tag) }),
		);

		expect(visibleTags.map(({ name }) => name)).toStrictEqual(["one", "two", "three", "four"]);
		expect(remainingTags).toBe(2);
	});

	it("counts no overflow when the Article carries exactly four tags", () => {
		expect(toArticleCardContent(makeArticle({ tags: ["a", "b", "c", "d"].map(tag) })).remainingTags).toBe(0);
	});

	it("answers no tags and no overflow for an Article filed under nothing", () => {
		const { visibleTags, remainingTags } = toArticleCardContent(makeArticle());

		expect(visibleTags).toStrictEqual([]);
		expect(remainingTags).toBe(0);
	});

	it("leaves the featured image undefined for an Article presented in its image-less form", () => {
		expect(toArticleCardContent(makeArticle()).featuredImage).toBeUndefined();
	});
});
