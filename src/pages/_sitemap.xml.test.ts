import { absoluteUrl, articleHref, PAGES_ROUTES, tagHref } from "@const/index";
import { NOINDEX_ROUTES } from "@const/noindexRoutes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as route from "./sitemap.xml";

const getLiveCollection = vi.hoisted(() => vi.fn());

vi.mock("astro:content", () => ({ getLiveCollection }));

const { GET } = route;

const ARTICLES = [{ id: "a-piece", data: { slug: "a-piece", updatedAt: "2026-01-02T00:00:00.000Z" } }];
const TAGS = [{ id: "craft", data: { slug: "craft" } }];

const context = {} as Parameters<typeof GET>[0];

const sitemap = async () => {
	const response = await GET(context);

	return { response, body: await response.text() };
};

beforeEach(() => {
	getLiveCollection.mockReset();
	getLiveCollection.mockImplementation(async (collection: string) => ({
		entries: collection === "articles" ? ARTICLES : collection === "tags" ? TAGS : [],
	}));
});

describe("the sitemap", () => {
	it("is rendered when it is asked for, so a newly published Article is listed without a build", () => {
		expect(route).not.toHaveProperty("prerender");
	});

	it("answers XML a crawler reads as a sitemap", async () => {
		const { response, body } = await sitemap();

		expect(response.headers.get("Content-Type")).toBe("application/xml; charset=utf-8");
		expect(body.startsWith('<?xml version="1.0" encoding="UTF-8"?><urlset')).toBe(true);
	});

	it("lists every Article with the time it last changed, and every Tag page", async () => {
		const { body } = await sitemap();

		expect(body).toContain(
			`<url><loc>${absoluteUrl(articleHref("a-piece"))}</loc><lastmod>2026-01-02T00:00:00.000Z</lastmod></url>`,
		);
		expect(body).toContain(`<loc>${absoluteUrl(tagHref("craft"))}</loc>`);
	});

	it("lists the pages that stand on their own, and none robots.txt keeps out of the index", async () => {
		const { body } = await sitemap();

		for (const page of [PAGES_ROUTES.HOME, PAGES_ROUTES.ABOUT, PAGES_ROUTES.ARTICLES, PAGES_ROUTES.TAGS]) {
			expect(body).toContain(`<loc>${absoluteUrl(page)}</loc>`);
		}
		for (const page of NOINDEX_ROUTES) {
			expect(body).not.toContain(absoluteUrl(page));
		}
	});

	it("reads the Articles and the Tags, and nothing else", async () => {
		await sitemap();

		expect(getLiveCollection.mock.calls.map(([collection]) => collection).toSorted()).toEqual(["articles", "tags"]);
	});
});
