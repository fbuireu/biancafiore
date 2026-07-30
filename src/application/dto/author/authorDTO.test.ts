import type { RawArticle } from "@application/dto/article/types";
import { authorDTO } from "@application/dto/author";
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
}

const makeArticle = ({
	slug,
	author = { fields: { name: "Bianca Fiore", slug: "bianca-fiore" } },
}: MakeArticleParams) => ({ fields: { slug, author } }) as unknown as RawArticle;

describe("authorDTO field mapping", () => {
	it("carries every authored field across and turns the profile image into url, dimensions and formats", () => {
		const [author] = authorDTO.create([
			[
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
			[],
		]);

		expect(author).toEqual({
			name: "Bianca Fiore",
			slug: "bianca-fiore",
			description: "Writes for a living",
			jobTitle: "Content writer",
			currentCompany: "Freelance",
			profileImage: {
				url: "//cdn/bianca.avif",
				details: { width: 512, height: 512 },
				formats: { avif: true, webp: false },
			},
			socialNetworks: ["https://linkedin.com/in/bianca", "https://x.com/bianca"],
			articles: [],
			latestArticle: undefined,
		});
	});

	it("maps an empty batch to an empty array synchronously, with no promise in sight", () => {
		const result = authorDTO.create([[], []]);

		expect(result).toEqual([]);
		expect(result).not.toBeInstanceOf(Promise);
	});

	it("preserves the order of the authors it was given", () => {
		const authors = authorDTO.create([
			[makeAuthor({ name: "Zoe", slug: "zoe" }), makeAuthor({ name: "Ada", slug: "ada" })],
			[],
		]);

		expect(authors.map(({ name }) => name)).toEqual(["Zoe", "Ada"]);
	});
});

describe("authorDTO article attribution", () => {
	it("collects the slugs of every article whose embedded author matches, as articles collection references", () => {
		const [author] = authorDTO.create([
			[makeAuthor({ name: "Bianca Fiore" })],
			[makeArticle({ slug: "first" }), makeArticle({ slug: "second" })],
		]);

		expect(author.articles).toEqual([
			{ id: "first", collection: "articles" },
			{ id: "second", collection: "articles" },
		]);
	});

	it("ignores articles written by somebody else", () => {
		const [author] = authorDTO.create([
			[makeAuthor({ name: "Bianca Fiore" })],
			[makeArticle({ slug: "hers" }), makeArticle({ slug: "his", author: { fields: { name: "Someone Else" } } })],
		]);

		expect(author.articles).toEqual([{ id: "hers", collection: "articles" }]);
	});

	it("ignores author links Contentful left unresolved instead of throwing on the missing fields", () => {
		const [author] = authorDTO.create([
			[makeAuthor()],
			[makeArticle({ slug: "unresolved", author: { sys: { type: "Link", linkType: "Entry", id: "x" } } })],
		]);

		expect(author.articles).toEqual([]);
	});

	it("matches on the author name rather than the slug, so two authors sharing a name share their articles", () => {
		const [first, second] = authorDTO.create([
			[
				makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" }),
				makeAuthor({ name: "Bianca Fiore", slug: "b-fiore" }),
			],
			[makeArticle({ slug: "only-article" })],
		]);

		expect(first.articles).toEqual([{ id: "only-article", collection: "articles" }]);
		expect(second.articles).toEqual([{ id: "only-article", collection: "articles" }]);
	});

	it("names the first article of the input batch latestArticle, whatever its publish date", () => {
		const [author] = authorDTO.create([
			[makeAuthor()],
			[makeArticle({ slug: "oldest" }), makeArticle({ slug: "newest" })],
		]);

		expect(author.latestArticle).toEqual({ id: "oldest", collection: "articles" });
	});

	it("leaves latestArticle undefined for an author with no articles", () => {
		const [author] = authorDTO.create([[makeAuthor()], []]);

		expect(author.articles).toEqual([]);
		expect(author.latestArticle).toBeUndefined();
	});
});
