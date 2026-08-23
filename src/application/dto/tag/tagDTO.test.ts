import type { RawArticle } from "@application/dto/article/types";
import type { RawAuthor } from "@application/dto/author/types";
import { createTagIndex } from "@application/dto/tag";
import type { RawTag } from "@application/dto/tag/types";
import { describe, expect, it, vi } from "vitest";

vi.mock("astro:content", () => ({ reference: () => ({ parse: (value: unknown) => value }) }));

interface NamedParams {
	name: string;
	slug: string;
}

const makeTag = ({ name, slug }: NamedParams) => ({ fields: { name, slug } }) as unknown as RawTag;

const makeAuthor = ({ name, slug }: NamedParams) => ({ fields: { name, slug } }) as unknown as RawAuthor;

interface MakeArticleParams {
	slug: string;
	authorSlug?: string;
	tagSlugs?: string[];
	isFavorite?: boolean;
	publishDate?: string;
}

const makeArticle = ({ slug, authorSlug, tagSlugs, isFavorite, publishDate }: MakeArticleParams) =>
	({
		fields: {
			slug,
			isFavorite,
			publishDate,
			author: authorSlug === undefined ? undefined : { fields: { slug: authorSlug } },
			tags: tagSlugs?.map((tagSlug) => ({ fields: { slug: tagSlug } })),
		},
	}) as unknown as RawArticle;

describe("createTagIndex index entries", () => {
	it("answers one flat entry per tag and per author, leaving the A–Z bucketing to the page that renders it", () => {
		const entries = createTagIndex({
			rawTags: [makeTag({ name: "craft", slug: "craft" })],
			rawArticles: [makeArticle({ slug: "first", authorSlug: "bianca-fiore", tagSlugs: ["craft"] })],
			rawAuthors: [makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" })],
		});

		expect(entries.map(({ name }) => name)).toEqual(["craft", "Bianca Fiore"]);
		expect(entries.map(({ type }) => type)).toEqual(["tag", "author"]);
	});

	it("maps an entirely empty CMS to no entries, synchronously", () => {
		const entries = createTagIndex({ rawTags: [], rawArticles: [], rawAuthors: [] });

		expect(entries).toEqual([]);
		expect(entries).not.toBeInstanceOf(Promise);
	});

	it("lists the articles carrying the tag as articles collection references, and counts nothing beside them", () => {
		const entries = createTagIndex({
			rawTags: [makeTag({ name: "Craft", slug: "craft" })],
			rawArticles: [
				makeArticle({ slug: "first", tagSlugs: ["craft"], publishDate: "2025-02-01" }),
				makeArticle({ slug: "second", tagSlugs: ["craft", "travel"], publishDate: "2025-01-01" }),
				makeArticle({ slug: "third", tagSlugs: ["travel"], publishDate: "2025-03-01" }),
			],
			rawAuthors: [],
		});

		expect(entries.at(0)).toEqual({
			name: "Craft",
			slug: "craft",
			type: "tag",
			articles: [
				{ id: "first", collection: "articles" },
				{ id: "second", collection: "articles" },
			],
		});
	});

	it("drops a tag no article references, so the index never shows an empty entry", () => {
		const entries = createTagIndex({
			rawTags: [makeTag({ name: "Craft", slug: "craft" }), makeTag({ name: "Orphan", slug: "orphan" })],
			rawArticles: [makeArticle({ slug: "first", tagSlugs: ["craft"] })],
			rawAuthors: [],
		});

		expect(entries.map(({ slug }) => slug)).toEqual(["craft"]);
	});

	it("trims the whitespace Contentful preserves on both sides of the match", () => {
		const entries = createTagIndex({
			rawTags: [makeTag({ name: "  Craft  ", slug: "  craft  " })],
			rawArticles: [makeArticle({ slug: "  first  ", tagSlugs: [" craft "] })],
			rawAuthors: [],
		});

		expect(entries.at(0)).toMatchObject({
			name: "Craft",
			slug: "craft",
			articles: [{ id: "first", collection: "articles" }],
		});
	});

	it("ignores articles with no tag list at all", () => {
		const entries = createTagIndex({
			rawTags: [makeTag({ name: "Craft", slug: "craft" })],
			rawArticles: [makeArticle({ slug: "untagged" })],
			rawAuthors: [],
		});

		expect(entries).toEqual([]);
	});
});

describe("createTagIndex article order", () => {
	it("orders the references the way the blog listing does: favorites first, then newest to oldest", () => {
		const entries = createTagIndex({
			rawTags: [makeTag({ name: "Craft", slug: "craft" })],
			rawArticles: [
				makeArticle({ slug: "older", tagSlugs: ["craft"], publishDate: "2024-01-01" }),
				makeArticle({ slug: "newest", tagSlugs: ["craft"], publishDate: "2026-01-01" }),
				makeArticle({ slug: "favorite", tagSlugs: ["craft"], publishDate: "2019-01-01", isFavorite: true }),
			],
			rawAuthors: [],
		});

		expect(entries.at(0)?.articles.map(({ id }) => id)).toEqual(["favorite", "newest", "older"]);
	});

	it("orders an author's articles by the same rule, so both kinds of page read one order", () => {
		const entries = createTagIndex({
			rawTags: [],
			rawArticles: [
				makeArticle({ slug: "older", authorSlug: "ada", publishDate: "2024-01-01" }),
				makeArticle({ slug: "favorite", authorSlug: "ada", publishDate: "2020-01-01", isFavorite: true }),
				makeArticle({ slug: "newest", authorSlug: "ada", publishDate: "2026-01-01" }),
			],
			rawAuthors: [makeAuthor({ name: "Ada Lovelace", slug: "ada" })],
		});

		expect(entries.at(0)?.articles.map(({ id }) => id)).toEqual(["favorite", "newest", "older"]);
	});

	it("keeps the CMS order for articles Contentful never gave a publish date", () => {
		const entries = createTagIndex({
			rawTags: [makeTag({ name: "Craft", slug: "craft" })],
			rawArticles: [
				makeArticle({ slug: "first", tagSlugs: ["craft"] }),
				makeArticle({ slug: "second", tagSlugs: ["craft"] }),
			],
			rawAuthors: [],
		});

		expect(entries.at(0)?.articles.map(({ id }) => id)).toEqual(["first", "second"]);
	});
});

describe("createTagIndex author entries", () => {
	it("turns an author into a tag of type author, listing the articles they signed", () => {
		const entries = createTagIndex({
			rawTags: [],
			rawArticles: [
				makeArticle({ slug: "first", authorSlug: "bianca-fiore" }),
				makeArticle({ slug: "second", authorSlug: "someone-else" }),
			],
			rawAuthors: [makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" })],
		});

		expect(entries.at(0)).toEqual({
			name: "Bianca Fiore",
			slug: "bianca-fiore",
			type: "author",
			articles: [{ id: "first", collection: "articles" }],
		});
	});

	it("drops an author who has not published anything", () => {
		const entries = createTagIndex({
			rawTags: [],
			rawArticles: [],
			rawAuthors: [makeAuthor({ name: "Ghost Writer", slug: "ghost" })],
		});

		expect(entries).toEqual([]);
	});

	it("matches an author on the slug, so an article by a namesake with another slug does not count", () => {
		const entries = createTagIndex({
			rawTags: [],
			rawArticles: [makeArticle({ slug: "first", authorSlug: "b-fiore" })],
			rawAuthors: [makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" })],
		});

		expect(entries).toEqual([]);
	});

	it("keeps two authors who share a display name apart, each listing only the articles under its own slug", () => {
		const entries = createTagIndex({
			rawTags: [],
			rawArticles: [
				makeArticle({ slug: "hers", authorSlug: "bianca-fiore" }),
				makeArticle({ slug: "the-namesakes", authorSlug: "b-fiore" }),
			],
			rawAuthors: [
				makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" }),
				makeAuthor({ name: "Bianca Fiore", slug: "b-fiore" }),
			],
		});

		expect(entries).toEqual([
			{
				name: "Bianca Fiore",
				slug: "bianca-fiore",
				type: "author",
				articles: [{ id: "hers", collection: "articles" }],
			},
			{
				name: "Bianca Fiore",
				slug: "b-fiore",
				type: "author",
				articles: [{ id: "the-namesakes", collection: "articles" }],
			},
		]);
	});

	it("ignores author links Contentful left unresolved instead of counting them", () => {
		const entries = createTagIndex({
			rawTags: [],
			rawArticles: [{ fields: { slug: "first", author: { sys: { type: "Link" } } } } as unknown as RawArticle],
			rawAuthors: [makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" })],
		});

		expect(entries).toEqual([]);
	});

	it("gives a slug the tag and the author share to the tag, so the index addresses each slug once", () => {
		const entries = createTagIndex({
			rawTags: [makeTag({ name: "Bianca", slug: "bianca" })],
			rawArticles: [makeArticle({ slug: "first", authorSlug: "bianca", tagSlugs: ["bianca"] })],
			rawAuthors: [makeAuthor({ name: "Bianca Fiore", slug: "bianca" })],
		});

		expect(entries).toEqual([
			{
				name: "Bianca",
				slug: "bianca",
				type: "tag",
				articles: [{ id: "first", collection: "articles" }],
			},
		]);
	});
});
