import {
	cmsAnswers,
	cmsFailsWith,
	cmsHoldsUntilQueries,
	cmsQueries,
	cmsQueriesOverlapped,
	cmsReferenceQueries,
	cmsRefersTo,
	cmsServesPagesOf,
	resetCms,
} from "@tests/doubles/cmsLayer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CmsError } from "../errors";
import { type CmsEntry, EMDASH_MAX_PAGE_SIZE, fetchEntries, fetchReferences } from "./entries";

vi.mock("./client", async () => {
	const actual = await vi.importActual<typeof import("./client")>("./client");
	const { cmsClientLayer } = await import("@tests/doubles/cmsLayer");

	return { ...actual, CmsClientLive: cmsClientLayer(actual.CmsClient) };
});

const entry = (slug: string) => ({ id: `id-${slug}`, slug, data: {}, terms: {}, updatedAt: "" });

const ARTICLE = entry("an-article");
const AUTHOR = entry("bianca-fiore");
const AUTHOR_REFERENCE = { id: AUTHOR.id };

type Entry = CmsEntry;
type ArticleEntry = CmsEntry<Record<string, unknown>, "author">;

beforeEach(() => {
	resetCms();
	cmsAnswers({ articles: [ARTICLE], authors: [AUTHOR] });
});

describe("fetchEntries", () => {
	it("answers with the entries of the one query it was given, asked for at EmDash's maximum page size", async () => {
		const [articles] = await fetchEntries<[Entry]>({ collection: "articles" });

		expect(articles).toEqual([{ ...ARTICLE, references: {} }]);
		expect(cmsQueries).toEqual([{ collection: "articles", limit: EMDASH_MAX_PAGE_SIZE }]);
	});

	it("passes the ordering through, so the CMS sorts before it pages", async () => {
		await fetchEntries<[Entry]>({ collection: "articles", orderBy: "publish_date", order: "desc" });

		expect(cmsQueries).toEqual([
			{ collection: "articles", orderBy: "publish_date", order: "desc", limit: EMDASH_MAX_PAGE_SIZE },
		]);
	});

	it("follows the cursor until the CMS stops handing one back, so a short page never truncates the answer", async () => {
		const articles = Array.from({ length: 5 }, (_, index) => entry(`article-${index}`));

		cmsAnswers({ articles });
		cmsServesPagesOf(2);

		const [fetched] = await fetchEntries<[Entry]>({ collection: "articles" });

		expect(fetched.map(({ slug }) => slug)).toEqual(articles.map(({ slug }) => slug));
		expect(cmsQueries.map(({ cursor }) => cursor)).toEqual([undefined, "2", "4"]);
	});

	it("stops at an explicit limit, so a caller that wants a slice still gets one", async () => {
		cmsAnswers({ articles: Array.from({ length: 5 }, (_, index) => entry(`article-${index}`)) });
		cmsServesPagesOf(2);

		const [fetched] = await fetchEntries<[Entry]>({ collection: "articles", limit: 3 });

		expect(fetched).toHaveLength(3);
		expect(cmsQueries.map(({ limit }) => limit)).toEqual([3, 1]);
	});

	it("gives up on a page that answers nothing, so a cursor the CMS cannot actually serve cannot hang the build", async () => {
		cmsServesPagesOf(0);

		const [fetched] = await fetchEntries<[Entry]>({ collection: "articles" });

		expect(fetched).toEqual([]);
		expect(cmsQueries).toHaveLength(1);
	});

	it("reads every reference field it was asked for, per entry, and answers them by field", async () => {
		cmsRefersTo({ collection: "articles", id: ARTICLE.id, field: "author", references: [AUTHOR_REFERENCE] });

		const [articles] = await fetchEntries<[ArticleEntry]>({ collection: "articles", references: ["author"] });

		expect(articles).toEqual([{ ...ARTICLE, references: { author: [AUTHOR_REFERENCE] } }]);
		expect(cmsReferenceQueries).toEqual([
			{ collection: "articles", id: ARTICLE.id, field: "author", limit: EMDASH_MAX_PAGE_SIZE },
		]);
	});

	it("follows the cursor of a reference field too, so a long hand-picked list arrives whole", async () => {
		const references = Array.from({ length: 3 }, (_, index) => ({ ...AUTHOR_REFERENCE, id: `author-${index}` }));

		cmsRefersTo({ collection: "articles", id: ARTICLE.id, field: "author", references });
		cmsServesPagesOf(2);

		const [[article]] = await fetchEntries<[ArticleEntry]>({ collection: "articles", references: ["author"] });

		expect(article.references.author).toEqual(references);
		expect(cmsReferenceQueries.map(({ cursor }) => cursor)).toEqual([undefined, "2"]);
	});

	it("answers an empty list for a reference field nothing was filed under", async () => {
		const [[article]] = await fetchEntries<[ArticleEntry]>({ collection: "articles", references: ["author"] });

		expect(article.references).toEqual({ author: [] });
	});

	it("answers one array per query, in the order the queries were written", async () => {
		const [authors, articles] = await fetchEntries<[Entry, Entry]>(
			{ collection: "authors" },
			{ collection: "articles" },
		);

		expect(authors.map(({ slug }) => slug)).toEqual([AUTHOR.slug]);
		expect(articles.map(({ slug }) => slug)).toEqual([ARTICLE.slug]);
	});

	it("runs every query at once, so a caller never has to ask for concurrency", async () => {
		cmsHoldsUntilQueries(2);

		await fetchEntries<[Entry, Entry]>({ collection: "authors" }, { collection: "articles" });

		expect(cmsQueriesOverlapped()).toBe(true);
	});

	it("rejects rather than answering short when the CMS fails, so a build dies loudly", async () => {
		cmsFailsWith(new CmsError({ message: "emdash is unreachable" }));

		await expect(fetchEntries<[Entry]>({ collection: "articles" })).rejects.toThrow("emdash is unreachable");
	});
});

describe("fetchReferences", () => {
	it("answers every reference of one field of one entry, following the cursor to the end", async () => {
		const references = Array.from({ length: 3 }, (_, index) => ({ ...AUTHOR_REFERENCE, id: `author-${index}` }));

		cmsRefersTo({ collection: "articles", id: ARTICLE.id, field: "related_articles", references });
		cmsServesPagesOf(2);

		await expect(
			fetchReferences({ collection: "articles", id: ARTICLE.id, field: "related_articles" }),
		).resolves.toEqual(references);
		expect(cmsReferenceQueries.map(({ cursor }) => cursor)).toEqual([undefined, "2"]);
	});

	it("rejects when the CMS fails, so the page fails loudly rather than showing a short list", async () => {
		cmsFailsWith(new CmsError({ message: "emdash is unreachable" }));

		await expect(
			fetchReferences({ collection: "articles", id: ARTICLE.id, field: "related_articles" }),
		).rejects.toThrow("emdash is unreachable");
	});
});
