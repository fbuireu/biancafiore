import { MEDIA_FILE_PATH } from "@infrastructure/cms/media";
import { avatar, rawByline, rawEntry } from "@tests/doubles/cmsEntries";
import { describe, expect, it } from "vitest";
import type { ArticleFields } from "../article/types";
import { createAuthors } from ".";
import type { RawAuthor } from "./types";

interface MakeAuthorParams {
	slug?: string;
	displayName?: string;
	bio?: string;
	customFields?: Record<string, unknown>;
}

const makeAuthor = ({
	slug = "bianca-fiore",
	displayName = "Bianca Fiore",
	bio = "Content writer",
	customFields = {
		job_title: "Writer",
		current_company: "Freelance",
		social_networks: "LinkedIn | https://linkedin.com/in/bianca",
	},
}: MakeAuthorParams = {}): RawAuthor =>
	rawByline({ slug, displayName, bio, avatar: avatar({ name: "bianca.jpg" }), customFields });

interface MakeArticleParams {
	slug: string;
	publishDate?: string;
	credits?: RawAuthor[];
}

const makeArticle = ({ slug, publishDate = "2024-01-01", credits = [] }: MakeArticleParams) =>
	rawEntry<ArticleFields>({
		id: `article-${slug.trim()}`,
		slug,
		data: { title: slug, content: [], publish_date: publishDate },
		bylines: credits,
	});

describe("createAuthors field mapping", () => {
	it("carries every authored field across and turns the profile image into url, dimensions and formats", () => {
		const [author] = createAuthors({
			rawAuthors: [
				{
					...makeAuthor({
						bio: "Writes for a living",
						customFields: {
							job_title: "Content writer",
							current_company: "Freelance",
							social_networks: "LinkedIn | https://linkedin.com/in/bianca\nX | https://x.com/bianca",
						},
					}),
					avatar: avatar({ name: "bianca.avif", mimeType: "image/avif", width: 512, height: 512 }),
				},
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
			rawAuthors: [makeAuthor({ displayName: "Zoe", slug: "zoe" }), makeAuthor({ displayName: "Ada", slug: "ada" })],
			rawArticles: [],
		});

		expect(authors.map(({ name }) => name)).toEqual(["Zoe", "Ada"]);
	});
});

describe("createAuthors article attribution", () => {
	const bianca = makeAuthor();

	it("names an article that credits the author, as an articles collection reference", () => {
		const [author] = createAuthors({
			rawAuthors: [bianca],
			rawArticles: [makeArticle({ slug: "only-one", credits: [bianca] })],
		});

		expect(author.latestArticle).toEqual({ id: "only-one", collection: "articles" });
	});

	it("keeps two authors who share a display name apart, because the byline is what identifies an author", () => {
		const namesake = makeAuthor({ slug: "b-fiore" });
		const [first, second] = createAuthors({
			rawAuthors: [bianca, namesake],
			rawArticles: [
				makeArticle({ slug: "hers", credits: [bianca] }),
				makeArticle({ slug: "the-namesakes", credits: [namesake] }),
			],
		});

		expect(first.latestArticle).toEqual({ id: "hers", collection: "articles" });
		expect(second.latestArticle).toEqual({ id: "the-namesakes", collection: "articles" });
	});

	it("references an article by its trimmed slug, because that is the id the articles collection stores", () => {
		const [author] = createAuthors({
			rawAuthors: [bianca],
			rawArticles: [makeArticle({ slug: " hers ", credits: [bianca] })],
		});

		expect(author.latestArticle).toEqual({ id: "hers", collection: "articles" });
	});

	it("names the newest of the author's articles latestArticle, even when it arrived last", () => {
		const [author] = createAuthors({
			rawAuthors: [bianca],
			rawArticles: [
				makeArticle({ slug: "oldest", publishDate: "2019-03-01", credits: [bianca] }),
				makeArticle({ slug: "newest", publishDate: "2026-07-30", credits: [bianca] }),
			],
		});

		expect(author.latestArticle).toEqual({ id: "newest", collection: "articles" });
	});

	it("ignores an article somebody else published more recently when naming latestArticle", () => {
		const someoneElse = makeAuthor({ slug: "someone-else" });
		const [author] = createAuthors({
			rawAuthors: [bianca, someoneElse],
			rawArticles: [
				makeArticle({ slug: "his", publishDate: "2026-07-30", credits: [someoneElse] }),
				makeArticle({ slug: "hers", publishDate: "2025-01-01", credits: [bianca] }),
			],
		});

		expect(author.latestArticle).toEqual({ id: "hers", collection: "articles" });
	});

	it("credits an article to every byline on it, not only the first", () => {
		const coAuthor = makeAuthor({ slug: "co-author" });
		const [, second] = createAuthors({
			rawAuthors: [bianca, coAuthor],
			rawArticles: [makeArticle({ slug: "together", credits: [bianca, coAuthor] })],
		});

		expect(second.latestArticle).toEqual({ id: "together", collection: "articles" });
	});

	it("leaves latestArticle undefined for an author with no articles", () => {
		expect(createAuthors({ rawAuthors: [bianca], rawArticles: [] })[0].latestArticle).toBeUndefined();
	});
});

describe("createAuthors, given an unreadable publish date", () => {
	it("refuses it rather than reading the article as the epoch and ranking it last", () => {
		const bianca = makeAuthor();

		expect(() =>
			createAuthors({
				rawAuthors: [bianca],
				rawArticles: [makeArticle({ slug: "nonsense", publishDate: "not-a-date", credits: [bianca] })],
			}),
		).toThrow('The Article "nonsense" (id article-nonsense) has an unreadable publish date (not-a-date)');
	});
});
