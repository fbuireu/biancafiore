import { MEDIA_FILE_PATH } from "@infrastructure/cms/media";
import { BLURHASH, rawEntry, rawImage } from "@tests/doubles/cmsEntries";
import { cmsAnswers, cmsQueries, cmsReferenceQueries, cmsRefersTo, resetCms } from "@tests/doubles/cmsLayer";
import { escapedRequests } from "@tests/doubles/network";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ArticleFields } from "../../dto/article/types";
import type { AuthorFields } from "../../dto/author/types";
import { articles, RELATED_ARTICLES_FIELD } from "./articles";

vi.mock("@infrastructure/cms/client", async () => {
	const actual = await vi.importActual<typeof import("@infrastructure/cms/client")>("@infrastructure/cms/client");
	const { cmsClientLayer } = await import("@tests/doubles/cmsLayer");

	return { ...actual, CmsClientLive: cmsClientLayer(actual.CmsClient) };
});

const AUTHOR = rawEntry<AuthorFields, "articles">({
	id: "author-bianca",
	slug: "bianca-fiore",
	data: {
		name: "Bianca Fiore",
		description: "Content writer",
		job_title: "Writer",
		current_company: "Freelance",
		profile_image: rawImage({ name: "bianca.jpg" }),
	},
});

interface MakeArticleParams {
	slug: string;
	publishDate: string;
	isFavorite?: boolean;
	featuredImage?: ArticleFields["featured_image"];
}

const articleId = (slug: string) => `article-${slug.trim()}`;

const makeArticle = ({ slug, publishDate, isFavorite, featuredImage }: MakeArticleParams) =>
	rawEntry<ArticleFields>({
		id: articleId(slug),
		slug,
		data: {
			title: `The title of ${slug}`,
			content: [],
			description: "A description",
			publish_date: publishDate,
			featured_image: featuredImage,
			is_favorite: isFavorite,
		},
	});

const answer = (rawArticles: ReturnType<typeof makeArticle>[]) => {
	cmsAnswers({ articles: rawArticles, authors: [AUTHOR] });
	cmsRefersTo({
		collection: "authors",
		id: AUTHOR.id,
		field: "articles",
		references: rawArticles.map(({ id }) => ({ id })),
	});
};

const loadAll = async () => {
	const result = await articles.loader.loadCollection({ collection: "articles" });

	if ("error" in result) throw result.error;

	return result.entries;
};

const loadOne = (slug: string) => articles.loader.loadEntry({ filter: { id: slug }, collection: "articles" });

beforeEach(() => {
	resetCms();
});

describe("articles loader", () => {
	it("asks for articles newest first, beside the authors with the list of articles each one is credited with", async () => {
		answer([makeArticle({ slug: "an-article", publishDate: "2024-03-15" })]);

		await loadAll();

		expect(cmsQueries).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ collection: "articles", orderBy: "publish_date", order: "desc" }),
				expect.objectContaining({ collection: "authors" }),
			]),
		);
		expect(cmsReferenceQueries.map(({ collection, field }) => `${collection}.${field}`)).toEqual(["authors.articles"]);
	});

	it("keys an entry by the trimmed slug, so a padded CMS slug still answers the references pointing at it", async () => {
		answer([makeArticle({ slug: "  an-article  ", publishDate: "2024-03-15" })]);

		const [entry] = await loadAll();

		expect(entry).toMatchObject({ id: "an-article", data: { slug: "an-article" } });
	});

	it("puts the favourites first and orders the rest newest first, whatever order the CMS answered in", async () => {
		answer([
			makeArticle({ slug: "middle", publishDate: "2024-03-01" }),
			makeArticle({ slug: "old-favourite", publishDate: "2023-01-01", isFavorite: true }),
			makeArticle({ slug: "newest", publishDate: "2024-05-01" }),
		]);

		const entries = await loadAll();

		expect(entries.map((entry) => entry.id)).toEqual(["old-favourite", "newest", "middle"]);
	});

	it("blurs the featured image from the blurhash EmDash stored, without asking the network for anything", async () => {
		answer([
			makeArticle({
				slug: "illustrated",
				publishDate: "2024-03-15",
				featuredImage: rawImage({ blurhash: BLURHASH }),
			}),
		]);

		const [entry] = await loadAll();

		expect(entry?.data.featuredImage).toMatchObject({
			url: `${MEDIA_FILE_PATH}hero.jpg`,
			placeholder: expect.stringMatching(/^data:image\/bmp;base64,/),
		});
		expect(escapedRequests).toEqual([]);
	});

	it("reads no article's hand-picked related articles for a list, which never shows them", async () => {
		answer([makeArticle({ slug: "first", publishDate: "2024-03-15" })]);

		await loadAll();

		expect(cmsReferenceQueries.some(({ field }) => field === RELATED_ARTICLES_FIELD)).toBe(false);
	});
});

describe("articles loader, one article", () => {
	it("reads the hand-picked related articles of that article alone, and answers them", async () => {
		const first = makeArticle({ slug: "first", publishDate: "2024-03-15" });
		const second = makeArticle({ slug: "second", publishDate: "2024-03-01" });

		answer([first, second]);
		cmsRefersTo({
			collection: "articles",
			id: first.id,
			field: RELATED_ARTICLES_FIELD,
			references: [{ id: second.id }],
		});

		const entry = await loadOne("first");

		expect(entry).toMatchObject({ id: "first", data: { relatedArticles: [{ id: "second", collection: "articles" }] } });
		expect(cmsReferenceQueries.filter(({ field }) => field === RELATED_ARTICLES_FIELD)).toEqual([
			expect.objectContaining({ collection: "articles", id: first.id }),
		]);
	});

	it("answers no entry for a slug no published article carries, and reads no references for it", async () => {
		answer([makeArticle({ slug: "first", publishDate: "2024-03-15" })]);

		await expect(loadOne("missing")).resolves.toBeUndefined();
		expect(cmsReferenceQueries.some(({ field }) => field === RELATED_ARTICLES_FIELD)).toBe(false);
	});
});
