import { MEDIA_FILE_PATH } from "@infrastructure/cms/media";
import { rawEntry, rawImage } from "@tests/doubles/cmsEntries";
import { describe, expect, it } from "vitest";
import type { ArticleFields } from "../article/types";
import { createAuthors } from ".";
import type { AuthorFields } from "./types";

interface MakeAuthorParams extends Partial<AuthorFields> {
	id?: string;
	slug?: string;
	credits?: string[];
}

const articleId = (slug: string) => `article-${slug.trim()}`;

const makeAuthor = ({ id, slug = "bianca-fiore", credits = [], ...fields }: MakeAuthorParams = {}) =>
	rawEntry<AuthorFields, "articles">({
		id: id ?? `author-${slug.trim()}`,
		slug,
		data: {
			name: "Bianca Fiore",
			description: "Content writer",
			job_title: "Writer",
			current_company: "Freelance",
			profile_image: rawImage({ name: "bianca.jpg", width: 400, height: 400 }),
			social_networks: [{ name: "LinkedIn", url: "https://linkedin.com/in/bianca" }],
			...fields,
		},
		references: { articles: credits.map((slug) => ({ id: articleId(slug) })) },
	});

interface MakeArticleParams {
	slug: string;
	publishDate?: string;
}

const makeArticle = ({ slug, publishDate = "2024-01-01" }: MakeArticleParams) =>
	rawEntry<ArticleFields>({
		id: articleId(slug),
		slug,
		data: { title: slug, content: [], publish_date: publishDate },
	});

describe("createAuthors field mapping", () => {
	it("carries every authored field across and turns the profile image into url, dimensions and formats", () => {
		const [author] = createAuthors({
			rawAuthors: [
				makeAuthor({
					description: "Writes for a living",
					job_title: "Content writer",
					profile_image: rawImage({ name: "bianca.avif", mimeType: "image/avif", width: 512, height: 512 }),
					social_networks: [
						{ name: "LinkedIn", url: "https://linkedin.com/in/bianca" },
						{ name: "X", url: "https://x.com/bianca" },
					],
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
				url: `${MEDIA_FILE_PATH}bianca.avif`,
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
	it("names an article the author's own list credits, as an articles collection reference", () => {
		const [author] = createAuthors({
			rawAuthors: [makeAuthor({ credits: ["only-one"] })],
			rawArticles: [makeArticle({ slug: "only-one" })],
		});

		expect(author.latestArticle).toEqual({ id: "only-one", collection: "articles" });
	});

	it("keeps two authors who share a display name apart, because the entry is what identifies an author", () => {
		const [first, second] = createAuthors({
			rawAuthors: [makeAuthor({ credits: ["hers"] }), makeAuthor({ slug: "b-fiore", credits: ["the-namesakes"] })],
			rawArticles: [makeArticle({ slug: "hers" }), makeArticle({ slug: "the-namesakes" })],
		});

		expect(first.latestArticle).toEqual({ id: "hers", collection: "articles" });
		expect(second.latestArticle).toEqual({ id: "the-namesakes", collection: "articles" });
	});

	it("references an article by its trimmed slug, because that is the id the articles collection stores", () => {
		const [author] = createAuthors({
			rawAuthors: [makeAuthor({ credits: ["hers"] })],
			rawArticles: [makeArticle({ slug: " hers " })],
		});

		expect(author.latestArticle).toEqual({ id: "hers", collection: "articles" });
	});

	it("names the newest of the author's articles latestArticle, even when it arrived last", () => {
		const [author] = createAuthors({
			rawAuthors: [makeAuthor({ credits: ["oldest", "newest"] })],
			rawArticles: [
				makeArticle({ slug: "oldest", publishDate: "2019-03-01" }),
				makeArticle({ slug: "newest", publishDate: "2026-07-30" }),
			],
		});

		expect(author.latestArticle).toEqual({ id: "newest", collection: "articles" });
	});

	it("ignores an article somebody else published more recently when naming latestArticle", () => {
		const [author] = createAuthors({
			rawAuthors: [makeAuthor({ credits: ["hers"] }), makeAuthor({ slug: "someone-else", credits: ["his"] })],
			rawArticles: [
				makeArticle({ slug: "his", publishDate: "2026-07-30" }),
				makeArticle({ slug: "hers", publishDate: "2025-01-01" }),
			],
		});

		expect(author.latestArticle).toEqual({ id: "hers", collection: "articles" });
	});

	it("ignores a credited article that is not published, since the list holds only what EmDash answered", () => {
		const [author] = createAuthors({
			rawAuthors: [makeAuthor({ credits: ["a-draft", "hers"] })],
			rawArticles: [makeArticle({ slug: "hers" })],
		});

		expect(author.latestArticle).toEqual({ id: "hers", collection: "articles" });
	});

	it("leaves latestArticle undefined for an author with no articles", () => {
		expect(createAuthors({ rawAuthors: [makeAuthor()], rawArticles: [] })[0].latestArticle).toBeUndefined();
	});
});

describe("createAuthors, given an unreadable publish date", () => {
	it("refuses it rather than reading the article as the epoch and ranking it last", () => {
		expect(() =>
			createAuthors({
				rawAuthors: [makeAuthor({ credits: ["nonsense"] })],
				rawArticles: [makeArticle({ slug: "nonsense", publishDate: "not-a-date" })],
			}),
		).toThrow('The Article "nonsense" (id article-nonsense) has an unreadable publish date (not-a-date)');
	});
});

describe("createAuthors, given an author whose required image is missing", () => {
	it("refuses it naming the gap, rather than emitting a profile with no picture", () => {
		expect(() =>
			createAuthors({ rawAuthors: [makeAuthor({ profile_image: undefined as never })], rawArticles: [] }),
		).toThrow("(no media at all)");
	});
});
