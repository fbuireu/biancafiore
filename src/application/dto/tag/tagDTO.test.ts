import { avatar, rawByline, rawEntry, term } from "@tests/doubles/cmsEntries";
import { describe, expect, it } from "vitest";
import type { AnyRawArticle, ArticleFields } from "../article/types";
import type { RawAuthor } from "../author/types";
import { createTagIndex } from ".";
import type { RawTag } from "./types";

const articleId = (slug: string) => `article-${slug.trim()}`;

interface MakeAuthorParams {
	name: string;
	slug: string;
	credits?: string[];
}

const creditedArticles = new Map<string, string[]>();

const makeAuthor = ({ name, slug, credits = [] }: MakeAuthorParams): RawAuthor => {
	const author = rawByline({ slug, displayName: name, avatar: avatar() });

	creditedArticles.set(author.id, credits.map(articleId));

	return author;
};

interface IndexParams {
	rawArticles: AnyRawArticle[];
	rawAuthors: RawAuthor[];
}

const index = ({ rawArticles, rawAuthors }: IndexParams) =>
	createTagIndex({
		rawArticles: rawArticles.map((rawArticle) => ({
			...rawArticle,
			bylines: rawAuthors.filter(({ id }) => creditedArticles.get(id)?.includes(rawArticle.id)),
		})),
		rawAuthors,
	});

interface MakeArticleParams {
	slug: string;
	tags?: RawTag[];
	isFavorite?: boolean;
	publishDate?: string;
}

const makeArticle = ({ slug, tags = [], isFavorite, publishDate = "2024-01-01" }: MakeArticleParams) =>
	rawEntry<ArticleFields>({
		id: articleId(slug),
		slug,
		terms: { tag: tags },
		data: { title: slug, content: [], is_favorite: isFavorite, publish_date: publishDate },
	});

const CRAFT = term({ slug: "craft", label: "Craft" });
const TRAVEL = term({ slug: "travel", label: "Travel" });

describe("createTagIndex index entries", () => {
	it("answers one flat entry per tag and per author, leaving the A–Z bucketing to the page that renders it", () => {
		const entries = index({
			rawArticles: [makeArticle({ slug: "first", tags: [CRAFT] })],
			rawAuthors: [makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore", credits: ["first"] })],
		});

		expect(entries.map(({ name }) => name)).toEqual(["Craft", "Bianca Fiore"]);
		expect(entries.map(({ type }) => type)).toEqual(["tag", "author"]);
	});

	it("maps an entirely empty CMS to no entries, synchronously", () => {
		const entries = index({ rawArticles: [], rawAuthors: [] });

		expect(entries).toEqual([]);
		expect(entries).not.toBeInstanceOf(Promise);
	});

	it("lists the articles carrying the tag as articles collection references, and counts nothing beside them", () => {
		const entries = index({
			rawArticles: [
				makeArticle({ slug: "first", tags: [CRAFT], publishDate: "2025-02-01" }),
				makeArticle({ slug: "second", tags: [CRAFT, TRAVEL], publishDate: "2025-01-01" }),
				makeArticle({ slug: "third", tags: [TRAVEL], publishDate: "2025-03-01" }),
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

	it("lists each tag once, in the order the articles first name it, however many articles carry it", () => {
		const entries = index({
			rawArticles: [
				makeArticle({ slug: "first", tags: [TRAVEL] }),
				makeArticle({ slug: "second", tags: [CRAFT, TRAVEL] }),
			],
			rawAuthors: [],
		});

		expect(entries.map(({ slug }) => slug)).toEqual(["travel", "craft"]);
	});

	it("trims the whitespace the CMS preserves on the term and on the article it lists", () => {
		const padded = term({ slug: "  craft  ", label: "  Craft  " });
		const entries = index({
			rawArticles: [makeArticle({ slug: "  first  ", tags: [padded] })],
			rawAuthors: [],
		});

		expect(entries.at(0)).toMatchObject({
			name: "Craft",
			slug: "craft",
			articles: [{ id: "first", collection: "articles" }],
		});
	});

	it("ignores articles filed under no tag at all", () => {
		expect(index({ rawArticles: [makeArticle({ slug: "untagged" })], rawAuthors: [] })).toEqual([]);
	});
});

describe("createTagIndex article order", () => {
	it("orders the references the way the blog listing does: favorites first, then newest to oldest", () => {
		const entries = index({
			rawArticles: [
				makeArticle({ slug: "older", tags: [CRAFT], publishDate: "2024-01-01" }),
				makeArticle({ slug: "newest", tags: [CRAFT], publishDate: "2026-01-01" }),
				makeArticle({ slug: "favorite", tags: [CRAFT], publishDate: "2019-01-01", isFavorite: true }),
			],
			rawAuthors: [],
		});

		expect(entries.at(0)?.articles.map(({ id }) => id)).toEqual(["favorite", "newest", "older"]);
	});

	it("orders an author's articles by the same rule, so both kinds of page read one order", () => {
		const entries = index({
			rawArticles: [
				makeArticle({ slug: "older", publishDate: "2024-01-01" }),
				makeArticle({ slug: "favorite", publishDate: "2020-01-01", isFavorite: true }),
				makeArticle({ slug: "newest", publishDate: "2026-01-01" }),
			],
			rawAuthors: [makeAuthor({ name: "Ada Lovelace", slug: "ada", credits: ["older", "favorite", "newest"] })],
		});

		expect(entries.at(0)?.articles.map(({ id }) => id)).toEqual(["favorite", "newest", "older"]);
	});

	it("keeps the CMS order for articles published on the same date", () => {
		const entries = index({
			rawArticles: [
				makeArticle({ slug: "first", tags: [CRAFT], publishDate: "2024-01-01" }),
				makeArticle({ slug: "second", tags: [CRAFT], publishDate: "2024-01-01" }),
			],
			rawAuthors: [],
		});

		expect(entries.at(0)?.articles.map(({ id }) => id)).toEqual(["first", "second"]);
	});

	it("refuses an article with an unreadable publish date, so the index cannot list one the collection rejects", () => {
		expect(() =>
			index({
				rawArticles: [makeArticle({ slug: "undated", tags: [CRAFT], publishDate: "" })],
				rawAuthors: [],
			}),
		).toThrow("has an unreadable publish date");
	});
});

describe("createTagIndex author entries", () => {
	it("turns an author into a tag of type author, listing the articles their own list credits", () => {
		const entries = index({
			rawArticles: [makeArticle({ slug: "first" }), makeArticle({ slug: "second" })],
			rawAuthors: [makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore", credits: ["first"] })],
		});

		expect(entries.at(0)).toEqual({
			name: "Bianca Fiore",
			slug: "bianca-fiore",
			type: "author",
			articles: [{ id: "first", collection: "articles" }],
		});
	});

	it("drops an author who has not published anything", () => {
		const entries = index({
			rawArticles: [],
			rawAuthors: [makeAuthor({ name: "Ghost Writer", slug: "ghost" })],
		});

		expect(entries).toEqual([]);
	});

	it("keeps two authors who share a display name apart, each listing only the articles credited to it", () => {
		const entries = index({
			rawArticles: [makeArticle({ slug: "hers" }), makeArticle({ slug: "the-namesakes" })],
			rawAuthors: [
				makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore", credits: ["hers"] }),
				makeAuthor({ name: "Bianca Fiore", slug: "b-fiore", credits: ["the-namesakes"] }),
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

	it("does not count a credited article that is not among the published ones", () => {
		const entries = index({
			rawArticles: [],
			rawAuthors: [makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore", credits: ["a-draft"] })],
		});

		expect(entries).toEqual([]);
	});

	it("gives a slug the tag and the author share to the tag, so the index addresses each slug once", () => {
		const entries = index({
			rawArticles: [makeArticle({ slug: "first", tags: [term({ slug: "bianca", label: "Bianca" })] })],
			rawAuthors: [makeAuthor({ name: "Bianca Fiore", slug: "bianca", credits: ["first"] })],
		});

		expect(entries).toEqual([
			{ name: "Bianca", slug: "bianca", type: "tag", articles: [{ id: "first", collection: "articles" }] },
		]);
	});

	it("refuses an author EmDash stored without a slug, naming them, since no page could address their Author Tag", () => {
		const unslugged: RawAuthor = { ...makeAuthor({ name: "Ada", slug: "ada", credits: ["first"] }), slug: null };

		expect(() => index({ rawArticles: [makeArticle({ slug: "first" })], rawAuthors: [unslugged] })).toThrow(
			'The Author "Ada" (id byline-ada) has no slug, so no page can address them',
		);
	});
});
