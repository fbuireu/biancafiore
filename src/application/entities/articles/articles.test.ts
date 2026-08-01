import type { RawArticle } from "@application/dto/article/types";
import { articles } from "@application/entities/articles/articles";
import { CmsError } from "@infrastructure/errors";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cmsAnswers, cmsFailsWith, cmsQueries, resetCms } from "@tests/doubles/cmsLayer";
import { imageDouble } from "@tests/doubles/network";

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

const PLACEHOLDER_BYTES = new Uint8Array([82, 73, 70, 70]);
const PLACEHOLDER = `data:image/webp;base64,${Buffer.from(PLACEHOLDER_BYTES).toString("base64")}`;

const load = () => (articles as unknown as { loader: () => Promise<Record<string, unknown>[]> }).loader();

const image = (url: string) => ({
	fields: { file: { url, contentType: "image/jpeg", details: { size: 1024, image: { width: 1200, height: 630 } } } },
});

const AUTHOR = {
	fields: {
		name: "Bianca Fiore",
		slug: "bianca-fiore",
		description: "Content writer",
		jobTitle: "Writer",
		currentCompany: "Freelance",
		profileImage: image("//images.ctfassets.net/bianca.jpg"),
		socialNetworks: [],
	},
};

const body = (value: string) => ({
	nodeType: "document",
	data: {},
	content: [{ nodeType: "paragraph", data: {}, content: [{ nodeType: "text", value, marks: [], data: {} }] }],
});

interface MakeArticleParams {
	slug: string;
	publishDate: string;
	isFavorite?: boolean;
	featuredImage?: unknown;
}

const makeArticle = ({ slug, publishDate, isFavorite, featuredImage }: MakeArticleParams) =>
	({
		sys: { updatedAt: publishDate },
		fields: {
			title: `The title of ${slug}`,
			slug,
			content: body("Body text"),
			description: "A description",
			publishDate,
			featuredImage,
			featuredArticle: false,
			isFavorite,
			author: AUTHOR,
			tags: [],
		},
	}) as unknown as RawArticle;

let cdn: ReturnType<typeof imageDouble>;

beforeEach(() => {
	resetCms();
	vi.stubEnv("CONTENTFUL_SPACE_ID", "space-id");
	cdn = imageDouble({ url: "https://images.ctfassets.net/*", bytes: PLACEHOLDER_BYTES.buffer });
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
});

describe("articles loader", () => {
	it("returns no entries and asks Contentful for nothing when the credentials are missing", async () => {
		vi.stubEnv("CONTENTFUL_SPACE_ID", undefined);
		cmsAnswers({ article: [makeArticle({ slug: "an-article", publishDate: "2024-03-15" })] });

		await expect(load()).resolves.toEqual([]);
		expect(cmsQueries).toEqual([]);
	});

	it("asks Contentful for articles, newest first", async () => {
		cmsAnswers({ article: [makeArticle({ slug: "an-article", publishDate: "2024-03-15" })] });

		await load();

		expect(cmsQueries).toEqual([{ content_type: "article", order: ["-fields.publishDate"] }]);
	});

	it("keys every entry by its slug", async () => {
		cmsAnswers({ article: [makeArticle({ slug: "an-article", publishDate: "2024-03-15" })] });

		const [entry] = await load();

		expect(entry).toMatchObject({ id: "an-article", slug: "an-article" });
	});

	it("puts the favourites first and orders the rest newest first, whatever order Contentful answered in", async () => {
		cmsAnswers({
			article: [
				makeArticle({ slug: "middle", publishDate: "2024-03-01" }),
				makeArticle({ slug: "old-favourite", publishDate: "2023-01-01", isFavorite: true }),
				makeArticle({ slug: "newest", publishDate: "2024-05-01" }),
			],
		});

		const entries = await load();

		expect(entries.map((entry) => entry.id)).toEqual(["old-favourite", "newest", "middle"]);
	});

	it("attaches a blur placeholder to the featured image after the DTO has run", async () => {
		cmsAnswers({
			article: [
				makeArticle({
					slug: "illustrated",
					publishDate: "2024-03-15",
					featuredImage: image("//images.ctfassets.net/hero.jpg"),
				}),
			],
		});

		const [entry] = await load();

		expect(entry.featuredImage).toMatchObject({
			url: "//images.ctfassets.net/hero.jpg",
			placeholder: PLACEHOLDER,
		});
		expect(cdn.calls).toStrictEqual(["https://images.ctfassets.net/hero.jpg?w=24&q=35&fm=webp"]);
	});

	it("leaves an article without a featured image without one, rather than inventing a placeholder", async () => {
		cmsAnswers({ article: [makeArticle({ slug: "plain", publishDate: "2024-03-15" })] });

		const [entry] = await load();

		expect(entry.featuredImage).toBeUndefined();
		expect(cdn.calls).toEqual([]);
	});

	it("fails the build instead of returning a short collection when Contentful errors", async () => {
		cmsFailsWith(new CmsError({ message: "contentful is unreachable" }));

		await expect(load()).rejects.toThrow("contentful is unreachable");
	});
});
