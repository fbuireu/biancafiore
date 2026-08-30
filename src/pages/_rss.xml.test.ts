import { absoluteUrl, articleHref, PAGES_ROUTES } from "@const/index";
import { DEFAULT_SEO_PARAMS } from "@modules/core/components/seo/const";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, prerender } from "./rss.xml";

const getCollection = vi.hoisted(() => vi.fn());
const rss = vi.hoisted(() => vi.fn((_options: unknown) => new Response("<rss />")));

vi.mock("astro:content", () => ({ getCollection }));
vi.mock("@astrojs/rss", () => ({ default: rss }));

interface MakeArticleParams {
	slug: string;
	title?: string;
	publishDateISO: string;
}

const makeArticle = ({ slug, title = slug, publishDateISO }: MakeArticleParams) => ({
	data: { slug, title, description: `About ${slug}`, publishDateISO },
});

interface FeedItem {
	title: string;
	description: string;
	pubDate: Date;
	link: string;
}

interface Feed {
	title: string;
	description: string;
	site: string;
	items: FeedItem[];
}

const feed = () => rss.mock.calls[0]?.[0] as Feed;

const context = {} as Parameters<typeof GET>[0];

beforeEach(() => {
	rss.mockClear();
	getCollection.mockResolvedValue([]);
});

describe("the feed", () => {
	it("is prerendered, so a reader never waits on the CMS for it", () => {
		expect(prerender).toBe(true);
	});

	it("names the site once, from the module that owns the origin", async () => {
		await GET(context);

		expect(feed().site).toBe(absoluteUrl(PAGES_ROUTES.HOME));
		expect(feed().title).toBe(DEFAULT_SEO_PARAMS.title);
		expect(feed().description).toBe(DEFAULT_SEO_PARAMS.description);
	});

	it("links each item through the route module rather than joining a slug by hand", async () => {
		getCollection.mockResolvedValue([makeArticle({ slug: "a-first-piece", publishDateISO: "2026-01-01" })]);

		await GET(context);

		expect(feed().items[0]?.link).toBe(articleHref("a-first-piece"));
	});

	it("carries each Article's own title and description", async () => {
		getCollection.mockResolvedValue([makeArticle({ slug: "a-piece", title: "A piece", publishDateISO: "2026-01-01" })]);

		await GET(context);

		expect(feed().items[0]).toMatchObject({ title: "A piece", description: "About a-piece" });
	});

	it("puts the newest Article first, whatever order the collection came back in", async () => {
		getCollection.mockResolvedValue([
			makeArticle({ slug: "middle", publishDateISO: "2026-02-01" }),
			makeArticle({ slug: "oldest", publishDateISO: "2025-06-01" }),
			makeArticle({ slug: "newest", publishDateISO: "2026-08-01" }),
		]);

		await GET(context);

		expect(feed().items.map(({ link }) => link)).toStrictEqual([
			articleHref("newest"),
			articleHref("middle"),
			articleHref("oldest"),
		]);
	});

	it("dates each item from the stored ISO string", async () => {
		getCollection.mockResolvedValue([makeArticle({ slug: "a-piece", publishDateISO: "2026-03-04" })]);

		await GET(context);

		expect(feed().items[0]?.pubDate).toStrictEqual(new Date("2026-03-04"));
	});

	it("answers an empty feed rather than failing when nothing is published", async () => {
		await expect(GET(context)).resolves.toBeInstanceOf(Response);
		expect(feed().items).toStrictEqual([]);
	});

	it("reads the Articles collection and no other", async () => {
		await GET(context);

		expect(getCollection).toHaveBeenCalledWith("articles");
	});
});
