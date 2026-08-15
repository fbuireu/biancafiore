import { fetchEntries } from "@infrastructure/cms/entries";
import { CmsError } from "@infrastructure/errors";
import {
	cmsAnswers,
	cmsFailsWith,
	cmsHoldsUntilQueries,
	cmsQueries,
	cmsQueriesOverlapped,
	cmsServesPagesOf,
	resetCms,
} from "@tests/doubles/cmsLayer";
import type { EntrySkeletonType } from "contentful";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@infrastructure/cms/client", async () => {
	const actual = await vi.importActual<typeof import("@infrastructure/cms/client")>("@infrastructure/cms/client");
	const { cmsClientLayer } = await import("@tests/doubles/cmsLayer");

	return { ...actual, CmsClientLive: cmsClientLayer(actual.CmsClient) };
});

const ARTICLE = { fields: { slug: "an-article" } };
const AUTHOR = { fields: { slug: "bianca-fiore" } };

beforeEach(() => {
	resetCms();
	vi.stubEnv("CONTENTFUL_SPACE_ID", "space-id");
	cmsAnswers({ article: [ARTICLE], author: [AUTHOR] });
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("fetchEntries", () => {
	it("answers with the entries of the one query it was given", async () => {
		const [articles] = await fetchEntries<[EntrySkeletonType]>({ content_type: "article" });

		expect(articles).toEqual([ARTICLE]);
		expect(cmsQueries).toEqual([{ content_type: "article", skip: 0, limit: 1000 }]);
	});

	it("asks for the whole result set at Contentful's maximum page size, so no caller passes a limit", async () => {
		await fetchEntries<[EntrySkeletonType]>({ content_type: "article" });

		expect(cmsQueries).toEqual([expect.objectContaining({ limit: 1000 })]);
	});

	it("keeps asking until the collection's total is reached, so a short page never truncates the answer", async () => {
		const articles = Array.from({ length: 5 }, (_, index) => ({ fields: { slug: `article-${index}` } }));

		cmsAnswers({ article: articles });
		cmsServesPagesOf(2);

		const [fetched] = await fetchEntries<[EntrySkeletonType]>({ content_type: "article" });

		expect(fetched).toEqual(articles);
		expect(cmsQueries.map(({ skip }) => skip)).toEqual([0, 2, 4]);
	});

	it("stops at an explicit limit, so a caller that wants a slice still gets one", async () => {
		cmsAnswers({ article: Array.from({ length: 5 }, (_, index) => ({ fields: { slug: `article-${index}` } })) });
		cmsServesPagesOf(2);

		const [fetched] = await fetchEntries<[EntrySkeletonType]>({ content_type: "article", limit: 3 });

		expect(fetched).toHaveLength(3);
		expect(cmsQueries).toEqual([
			{ content_type: "article", skip: 0, limit: 3 },
			{ content_type: "article", skip: 2, limit: 1 },
		]);
	});

	it("gives up on a page that answers nothing, so a lying total cannot hang the build", async () => {
		cmsAnswers({ article: [ARTICLE] });
		cmsServesPagesOf(0);

		const [fetched] = await fetchEntries<[EntrySkeletonType]>({ content_type: "article" });

		expect(fetched).toEqual([]);
		expect(cmsQueries).toHaveLength(1);
	});

	it("answers one array per query, in the order the queries were written", async () => {
		const [authors, articles] = await fetchEntries<[EntrySkeletonType, EntrySkeletonType]>(
			{ content_type: "author" },
			{ content_type: "article" },
		);

		expect(authors).toEqual([AUTHOR]);
		expect(articles).toEqual([ARTICLE]);
	});

	it("runs every query at once, so a caller never has to ask for concurrency", async () => {
		cmsHoldsUntilQueries(2);

		await fetchEntries<[EntrySkeletonType, EntrySkeletonType]>({ content_type: "author" }, { content_type: "article" });

		expect(cmsQueriesOverlapped()).toBe(true);
	});

	it("answers an empty array per query, and asks Contentful for nothing, without credentials", async () => {
		vi.stubEnv("CONTENTFUL_SPACE_ID", undefined);

		const collections = await fetchEntries<[EntrySkeletonType, EntrySkeletonType]>(
			{ content_type: "author" },
			{ content_type: "article" },
		);

		expect(collections).toEqual([[], []]);
		expect(cmsQueries).toEqual([]);
	});

	it("rejects rather than answering short when the CMS fails, so a build dies loudly", async () => {
		cmsFailsWith(new CmsError({ message: "contentful is unreachable" }));

		await expect(fetchEntries<[EntrySkeletonType]>({ content_type: "article" })).rejects.toThrow(
			"contentful is unreachable",
		);
	});
});
