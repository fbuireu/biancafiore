import type { RawArticle } from "@application/dto/article/types";
import type { RawAuthor } from "@application/dto/author/types";
import { authors } from "@application/entities/authors/authors";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	cmsAnswers,
	cmsHoldsUntilQueries,
	cmsQueries,
	cmsQueriesOverlapped,
	resetCms,
} from "@tests/doubles/cmsLayer";

vi.mock("astro:content", async () => {
	const { z } = await import("astro/zod");
	const unresolvable = () => {
		throw new Error("reference() is a stub here: a loader test cannot validate entries against the collection schema");
	};

	return { defineCollection: (collection: unknown) => collection, reference: () => z.custom(unresolvable) };
});

vi.mock("@infrastructure/cms/client", async () => {
	const actual = await vi.importActual<typeof import("@infrastructure/cms/client")>("@infrastructure/cms/client");
	const { cmsClientLayer } = await import("@tests/doubles/cmsLayer");

	return { ...actual, CmsClientLive: cmsClientLayer(actual.CmsClient) };
});

const load = () => (authors as unknown as { loader: () => Promise<Record<string, unknown>[]> }).loader();

const image = (url: string) => ({
	fields: { file: { url, contentType: "image/jpeg", details: { size: 1024, image: { width: 400, height: 400 } } } },
});

interface MakeAuthorParams {
	name: string;
	slug: string;
}

const makeAuthor = ({ name, slug }: MakeAuthorParams) =>
	({
		fields: {
			name,
			slug,
			description: "Content writer",
			jobTitle: "Writer",
			currentCompany: "Freelance",
			profileImage: image(`//images.ctfassets.net/${slug}.jpg`),
			socialNetworks: [],
		},
	}) as unknown as RawAuthor;

interface MakeArticleParams {
	slug: string;
	publishDate: string;
	authorSlug: string;
}

const makeArticle = ({ slug, publishDate, authorSlug }: MakeArticleParams) =>
	({
		fields: { slug, publishDate, author: makeAuthor({ name: authorSlug, slug: authorSlug }) },
	}) as unknown as RawArticle;

const BIANCA = makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" });

beforeEach(() => {
	resetCms();
	vi.stubEnv("CONTENTFUL_SPACE_ID", "space-id");
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("authors loader", () => {
	it("returns no entries and asks Contentful for nothing when the credentials are missing", async () => {
		vi.stubEnv("CONTENTFUL_SPACE_ID", undefined);
		cmsAnswers({ author: [BIANCA] });

		await expect(load()).resolves.toEqual([]);
		expect(cmsQueries).toEqual([]);
	});

	it("asks for authors and for their articles newest first, in one batch", async () => {
		cmsAnswers({ author: [BIANCA], article: [] });
		cmsHoldsUntilQueries(2);

		await load();

		expect(cmsQueries).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ content_type: "author" }),
				expect.objectContaining({ content_type: "article", order: ["-fields.publishDate"] }),
			]),
		);
		expect(cmsQueries).toHaveLength(2);
		expect(cmsQueriesOverlapped()).toBe(true);
	});

	it("keys every entry by the author's name", async () => {
		cmsAnswers({ author: [BIANCA], article: [] });

		const [entry] = await load();

		expect(entry).toMatchObject({ id: "Bianca Fiore", name: "Bianca Fiore", slug: "bianca-fiore" });
	});

	it("lists an author's articles newest first, and calls the newest one the latest", async () => {
		cmsAnswers({
			author: [makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" })],
			article: [
				makeArticle({ slug: "oldest", publishDate: "2023-01-01", authorSlug: "bianca-fiore" }),
				makeArticle({ slug: "newest", publishDate: "2024-05-01", authorSlug: "bianca-fiore" }),
				makeArticle({ slug: "middle", publishDate: "2024-03-01", authorSlug: "bianca-fiore" }),
			],
		});

		const [entry] = await load();

		expect(entry.articles).toEqual([
			{ id: "newest", collection: "articles" },
			{ id: "middle", collection: "articles" },
			{ id: "oldest", collection: "articles" },
		]);
		expect(entry.latestArticle).toEqual({ id: "newest", collection: "articles" });
	});

	it("gives an author only their own articles, and no latest article when they have none", async () => {
		cmsAnswers({
			author: [
				makeAuthor({ name: "Bianca Fiore", slug: "bianca-fiore" }),
				makeAuthor({ name: "Ghost", slug: "ghost" }),
			],
			article: [makeArticle({ slug: "hers", publishDate: "2024-05-01", authorSlug: "bianca-fiore" })],
		});

		const [bianca, ghost] = await load();

		expect(bianca.articles).toEqual([{ id: "hers", collection: "articles" }]);
		expect(ghost.articles).toEqual([]);
		expect(ghost.latestArticle).toBeUndefined();
	});
});
