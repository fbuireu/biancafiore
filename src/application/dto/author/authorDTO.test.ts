import type { RawArticle } from "@application/dto/article/types";
import { createAuthors } from "@application/dto/author";
import type { RawAuthor } from "@application/dto/author/types";
import { describe, expect, it } from "vitest";

interface AssetParams {
	url?: string;
	contentType?: string;
	width?: number;
	height?: number;
}

const asset = ({
	url = "//images.ctfassets.net/bianca.jpg",
	contentType = "image/jpeg",
	width = 400,
	height = 400,
}: AssetParams = {}) => ({
	fields: { file: { url, contentType, details: { size: 1024, image: { width, height } } } },
});

interface MakeAuthorParams {
	name?: string;
	slug?: string;
	description?: string;
	jobTitle?: string;
	currentCompany?: string;
	profileImage?: unknown;
	socialNetworks?: string[];
}

const makeAuthor = ({
	name = "Bianca Fiore",
	slug = "bianca-fiore",
	description = "Content writer",
	jobTitle = "Writer",
	currentCompany = "Freelance",
	profileImage = asset(),
	socialNetworks = ["https://linkedin.com/in/bianca"],
}: MakeAuthorParams = {}) =>
	({
		fields: { name, slug, description, jobTitle, currentCompany, profileImage, socialNetworks },
	}) as unknown as RawAuthor;

interface MakeArticleParams {
	slug: string;
	author?: unknown;
	publishDate?: string;
}

const makeArticle = ({
	slug,
	author = { fields: { name: "Bianca Fiore", slug: "bianca-fiore" } },
	publishDate = "2024-01-01",
}: MakeArticleParams) => ({ fields: { slug, author, publishDate } }) as unknown as RawArticle;

describe("createAuthors field mapping", () => {
	it("carries every authored field across and turns the profile image into url, dimensions and formats", () => {
		const [author] = createAuthors({
			rawAuthors: [
				makeAuthor({
					name: "Bianca Fiore",
					slug: "bianca-fiore",
					description: "Writes for a living",
					jobTitle: "Content writer",
					currentCompany: "Freelance",
					profileImage: asset({ url: "//cdn/bianca.avif", contentType: "image/avif", width: 512, height: 512 }),
					socialNetworks: ["https://linkedin.com/in/bianca", "https://x.com/bianca"],
				}),
			],
			rawArticles: [],
		});

		expect(author).toEqual({
			name: "Bianca Fiore",
			slug: "bianca-fiore",
			description: "Writes for a living",
			jobTitle: "Content writer",
			currentCompany: "Freelance",
			profileImage: {
				url: "https://cdn/bianca.avif",
				details: { width: 512, height: 512 },
				formats: { avif: true, webp: false },
				shareCrops: expect.any(Array),
			},
			socialNetworks: ["https://linkedin.com/in/bianca", "https://x.com/bianca"],
			latestArticle: undefined,
		});
	});

	it("maps an empty batch to an empty array synchronously, with no promise in sight", () => {
		const result = createAuthors({ rawAuthors: [], rawArticles: [] });

		expect(result).toEqual([]);
		expect(result).not.toBeInstanceOf(Promise);
	});

	it("preserves the order of the authors it was given", () => {
		const authors = createAuthors({
			rawAuthors: [makeAuthor({ name: "Zoe", slug: "zoe" }), makeAuthor({ name: "Ada", slug: "ada" })],
			rawArticles: [],
		});

		expect(authors.map(({ name }) => name)).toEqual(["Zoe", "Ada"]);
	});
});

describe("createAuthors article attribution", () => {
	it("names an article whose embedded author matches, as an articles collection reference", () => {
		const [author] = createAuthors({
			rawAuthors: [makeAuthor({ name: "Bianca Fiore" })],
			rawArticles: [makeArticle({ slug: "only-one" })],
		});

		expect(author.latestArticle).toEqual({ id: "only-one", collection: "articles" });
	});

	it("ignores articles written by somebody else", () => {
		const [author] = createAuthors({
			rawAuthors: [makeAuthor({ name: "Bianca Fiore" })],
			rawArticles: [
				makeArticle({ slug: "hers" }),
				makeArticle({ slug: "his", author: { fields: { name: "Someone Else", slug: "someone-else" } } }),
			],
		});

		expect(author.latestArticle).toEqual({ id: "hers", collection: "articles" });
	});

	it("ignores author links Contentful left unresolved instead of throwing on the missing fields", () => {
		const [author] = createAuthors({
			rawAuthors: [makeAuthor()],
			rawArticles: [makeArticle({ slug: "unresolved", author: { sys: { type: "Link", linkType: "Entry", id: "x" } } })],
		});

		expect(author.latestArticle).toBeUndefined();
	});

	it("keeps two authors who share a display name apart, because the slug is what identifies an author", () => {
		const [first, second] = createAuthors({
			rawAuthors: [
				makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" }),
				makeAuthor({ name: "Bianca Fiore", slug: "b-fiore" }),
			],
			rawArticles: [
				makeArticle({ slug: "hers", author: { fields: { name: "Bianca Fiore", slug: "bianca-fiore" } } }),
				makeArticle({ slug: "the-namesakes", author: { fields: { name: "Bianca Fiore", slug: "b-fiore" } } }),
			],
		});

		expect(first.latestArticle).toEqual({ id: "hers", collection: "articles" });
		expect(second.latestArticle).toEqual({ id: "the-namesakes", collection: "articles" });
	});

	it("matches an author whose slug Contentful padded with whitespace on either side", () => {
		const [author] = createAuthors({
			rawAuthors: [makeAuthor({ slug: " bianca-fiore " })],
			rawArticles: [
				makeArticle({ slug: "hers", author: { fields: { name: "Bianca Fiore", slug: "bianca-fiore  " } } }),
			],
		});

		expect(author.latestArticle).toEqual({ id: "hers", collection: "articles" });
	});

	it("emits the trimmed slug it matched on, so the author tag it becomes addresses the page a byline links to", () => {
		const [author] = createAuthors({ rawAuthors: [makeAuthor({ slug: " bianca-fiore " })], rawArticles: [] });

		expect(author.slug).toBe("bianca-fiore");
	});

	it("references an article by its trimmed slug, because that is the id the articles collection stores", () => {
		const [author] = createAuthors({ rawAuthors: [makeAuthor()], rawArticles: [makeArticle({ slug: " hers " })] });

		expect(author.latestArticle).toEqual({ id: "hers", collection: "articles" });
	});

	it("names the newest of the author's articles latestArticle, even when it arrived last", () => {
		const [author] = createAuthors({
			rawAuthors: [makeAuthor()],
			rawArticles: [
				makeArticle({ slug: "oldest", publishDate: "2019-03-01" }),
				makeArticle({ slug: "newest", publishDate: "2026-07-30" }),
			],
		});

		expect(author.latestArticle).toEqual({ id: "newest", collection: "articles" });
	});

	it("ignores an article somebody else published more recently when naming latestArticle", () => {
		const [author] = createAuthors({
			rawAuthors: [makeAuthor({ slug: "bianca-fiore" })],
			rawArticles: [
				makeArticle({
					slug: "his",
					author: { fields: { name: "Someone Else", slug: "someone-else" } },
					publishDate: "2026-07-30",
				}),
				makeArticle({ slug: "hers", publishDate: "2025-01-01" }),
			],
		});

		expect(author.latestArticle).toEqual({ id: "hers", collection: "articles" });
	});

	it("leaves latestArticle undefined for an author with no articles", () => {
		const [author] = createAuthors({ rawAuthors: [makeAuthor()], rawArticles: [] });

		expect(author.latestArticle).toBeUndefined();
	});
});

describe("createAuthors, given an author link Contentful did not resolve", () => {
	it("refuses it by the link id, the same way the article mapper does", () => {
		const unresolved = { sys: { type: "Link", linkType: "Entry", id: "7zXbYcVdE" } } as unknown as RawAuthor;

		expect(() => createAuthors({ rawAuthors: [unresolved], rawArticles: [] })).toThrow(
			"A raw author entry reached the mapper unresolved (7zXbYcVdE), so no byline can name it",
		);
	});
});
