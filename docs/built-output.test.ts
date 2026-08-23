import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NOINDEX_ROUTES } from "@const/noindexRoutes";
import { describe, expect, it } from "vitest";

const CLIENT = "dist/client";
const HEADING_TAG = /<h([1-6])[^>]*>/g;
const LOCATION = /<loc>([^<]*)<\/loc>/g;
const SCOPES = /--scopes: ([^"]*)"/;
const TABLE_OF_CONTENTS = "article__table-of-contents";

const read = (path: string): string => readFileSync(path, "utf-8");

const pageAt = (route: string): string => join(CLIENT, route, "index.html");

const articlePages = (): string[] =>
	readdirSync(join(CLIENT, "articles"), { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => join(CLIENT, "articles", entry.name, "index.html"));

const headingLevels = (html: string): number[] => [...html.matchAll(HEADING_TAG)].map(([, level]) => Number(level));

const locations = (): string[] =>
	[...read(join(CLIENT, "sitemap-0.xml")).matchAll(LOCATION)].map(([, url]) => new URL(url).pathname);

describe("the built output", () => {
	it("exists, because every assertion below reads it rather than the source", () => {
		expect(
			existsSync(CLIENT),
			"run `pnpm build` first: these assertions cover defects no source-level tool can see",
		).toBe(true);
	});

	it("renders the table of contents on every article whose headings earn one", () => {
		const owed = articlePages().filter((page) => {
			const scopes = SCOPES.exec(read(page))?.[1]?.trim() ?? "";

			return scopes.length > 0 && scopes.split(",").length > 1;
		});

		expect(owed.length).toBeGreaterThan(0);
		expect(owed.filter((page) => !read(page).includes(TABLE_OF_CONTENTS))).toEqual([]);
	});

	it("keeps the rendered article body, which set:html once replaced with nothing else", () => {
		expect(articlePages().filter((page) => !read(page).includes('class="article-wrapper"'))).toEqual([]);
	});

	it("lists every page in the sitemap except the ones robots.txt disallows", () => {
		const listed = locations();

		for (const route of ["/", "/about", "/articles", "/contact", "/projects", "/tags"]) {
			expect(`${route}: ${listed.includes(route)}`).toBe(`${route}: true`);
		}

		expect(listed.filter((route) => NOINDEX_ROUTES.some((noindex) => route.startsWith(noindex)))).toEqual([]);
	});

	it("agrees with itself about where a page lives, trailing slash included", () => {
		const feed = read(join(CLIENT, "rss.xml"));
		const [firstArticle] = locations().filter((route) => route.startsWith("/articles/"));

		expect(feed).toContain(`<link>https://biancafiore.me${firstArticle}</link>`);
		expect(feed).not.toContain(`${firstArticle}/</link>`);
	});

	it("skips no heading level and never puts a deeper heading above a shallower one", () => {
		const outlines = ["about", "contact", "privacy-policy", "terms-and-conditions"].map((route) => ({
			route,
			levels: headingLevels(read(pageAt(route))),
		}));

		for (const { route, levels } of outlines) {
			const skips = levels.filter((level, index) => index > 0 && level - (levels[index - 1] as number) > 1);

			expect(`${route}: ${JSON.stringify(skips)}`).toBe(`${route}: []`);
			expect(`${route}: ${levels[0]}`).toBe(`${route}: 1`);
		}
	});

	it("serves no script origin the site does not use", () => {
		expect(read(join(CLIENT, "_headers"))).not.toContain("unpkg.com");
	});
});
