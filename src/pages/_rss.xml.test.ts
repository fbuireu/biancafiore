import { absoluteUrl, articleHref, PAGES_ROUTES } from "@const/index";
import { DEFAULT_SEO_PARAMS } from "@modules/core/components/seo/const";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as route from "./rss.xml";

const getLiveCollection = vi.hoisted(() => vi.fn());
const rss = vi.hoisted(() => vi.fn((_options: unknown) => new Response("<rss />")));

vi.mock("astro:content", () => ({ getLiveCollection }));

const { GET } = route;

const answers = (articles: ReturnType<typeof makeArticle>[]) =>
	getLiveCollection.mockResolvedValue({ entries: articles });
vi.mock("@astrojs/rss", () => ({ default: rss }));

interface MakeArticleParams {
	slug: string;
	title?: string;
	publishDateISO: string;
}

const makeArticle = ({ slug, title = slug, publishDateISO }: MakeArticleParams) => ({
	id: slug,
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
	getLiveCollection.mockReset();
	answers([]);
});

describe("the feed", () => {
	it("is rendered when it is asked for, so a newly published Article reaches subscribers without a build", () => {
		expect(route).not.toHaveProperty("prerender");
	});

	it("names the site once, from the module that owns the origin", async () => {
		await GET(context);

		expect(feed().site).toBe(absoluteUrl(PAGES_ROUTES.HOME));
		expect(feed().title).toBe(DEFAULT_SEO_PARAMS.title);
		expect(feed().description).toBe(DEFAULT_SEO_PARAMS.description);
	});

	it("links each item through the route module rather than joining a slug by hand", async () => {
		answers([makeArticle({ slug: "a-first-piece", publishDateISO: "2026-01-01" })]);

		await GET(context);

		expect(feed().items[0]?.link).toBe(articleHref("a-first-piece"));
	});

	it("carries each Article's own title and description", async () => {
		answers([makeArticle({ slug: "a-piece", title: "A piece", publishDateISO: "2026-01-01" })]);

		await GET(context);

		expect(feed().items[0]).toMatchObject({ title: "A piece", description: "About a-piece" });
	});

	it("orders the items reverse-chronologically, whatever order the collection came back in", async () => {
		answers([
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
		answers([makeArticle({ slug: "a-piece", publishDateISO: "2026-03-04" })]);

		await GET(context);

		expect(feed().items[0]?.pubDate).toStrictEqual(new Date("2026-03-04"));
	});

	it("answers an empty feed rather than failing when nothing is published", async () => {
		await expect(GET(context)).resolves.toBeInstanceOf(Response);
		expect(feed().items).toStrictEqual([]);
	});

	it("reads the Articles collection and no other", async () => {
		await GET(context);

		expect(getLiveCollection.mock.calls).toStrictEqual([["articles"]]);
	});
});
