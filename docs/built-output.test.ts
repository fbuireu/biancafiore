import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NOINDEX_ROUTES } from "@const/noindexRoutes";
import { TABLE_OF_CONTENTS_WRAPPER_CLASS } from "@modules/article/components/tableOfContents/const";
import { ARTICLE_BODY_CLASS } from "@modules/article/const";
import { COOKIE_CONSENT_BUTTON_CLASS } from "@modules/core/components/cookieConsent/const";
import { describe, expect, it } from "vitest";

const CLIENT = "dist/client";
const HEADING_TAG = /<h([1-6])[^>]*>/g;
const LOCATION = /<loc>([^<]*)<\/loc>/g;
const SCOPES = /--scopes: ([^"]*)"/;
const HIDES_CHROME = process.env.HIDE_CHROME === "true";
const HTML_LANG = /<html lang="([^"]*)"/;
const OG_LOCALE = /<meta property="og:locale" content="([^"]*)"\s*\/?>/;
const ROBOTS_META = /<meta name="robots" content="([^"]*)"\s*\/?>/;
const INDEXED_ROUTES = ["", "about", "articles", "projects", "tags"];
const ISLAND = "<astro-island";
const COOKIE_CONSENT_BUTTON = new RegExp(`<button[^>]*class="[^"]*\\b${COOKIE_CONSENT_BUTTON_CLASS}\\b`);
const CONTENT_SECURITY_POLICY = /^\s+Content-Security-Policy: (.+)$/m;
const SCRIPT_ELEMENT = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/g;
const SCRIPT_WITH_A_SOURCE = /\ssrc=/;
const SCRIPT_TYPE = /\stype="([^"]*)"/;
const EXECUTABLE_SCRIPT_TYPES = new Set(["", "module", "text/javascript"]);
const DIGEST_SOURCE_PREFIX = "'sha256-";
const SCRIPT_AND_STYLE_ELEMENTS = /<(script|style)[\s>][\s\S]*?<\/\1>/g;
const EVENT_HANDLER_ATTRIBUTE = /<[a-z][^>]*\son[a-z]+\s*=/i;
const JAVASCRIPT_URL = /\s(?:href|src|action|formaction)\s*=\s*"javascript:/i;
const HEADER_LINE_LIMIT = 2000;

const read = (path: string): string => readFileSync(path, "utf-8");

const pageAt = (route: string): string => join(CLIENT, route, "index.html");

const prerenderedPages = (): string[] =>
	readdirSync(CLIENT, { recursive: true, encoding: "utf-8" })
		.filter((path) => path.endsWith("index.html"))
		.map((path) => join(CLIENT, path));

const inlineScriptsOf = (html: string): string[] =>
	[...html.matchAll(SCRIPT_ELEMENT)]
		.filter(
			([, attributes = ""]) =>
				!SCRIPT_WITH_A_SOURCE.test(attributes) && EXECUTABLE_SCRIPT_TYPES.has(SCRIPT_TYPE.exec(attributes)?.[1] ?? ""),
		)
		.map(([, , body]) => body);

const digest = (script: string): string => createHash("sha256").update(script, "utf8").digest("base64");

const scriptSourcesOf = (headers: string): string[] =>
	(CONTENT_SECURITY_POLICY.exec(headers)?.[1] ?? "")
		.split("; ")
		.find((directive) => directive.startsWith("script-src "))
		?.split(" ")
		.slice(1) ?? [];

const articlePages = (): string[] =>
	readdirSync(join(CLIENT, "articles"), { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => join(CLIENT, "articles", entry.name, "index.html"));

const headingLevels = (html: string): number[] => [...html.matchAll(HEADING_TAG)].map(([, level]) => Number(level));

const ARTICLE_BODY = new RegExp(`<article class="${ARTICLE_BODY_CLASS}"[\\s\\S]*?</article>`);

const withoutArticleBody = (html: string): string => html.replace(ARTICLE_BODY, "");

const sitemapUrls = (): string[] => [...read(join(CLIENT, "sitemap-0.xml")).matchAll(LOCATION)].map(([, url]) => url);

const locations = (): string[] => sitemapUrls().map((url) => new URL(url).pathname);

describe("the built output", () => {
	it("exists, because every assertion below reads it rather than the source", () => {
		expect(
			existsSync(CLIENT),
			"run `pnpm build` first: these assertions cover defects no source-level tool can see",
		).toBe(true);
	});

	it("renders the table of contents on every article whose headings earn one, unless the chrome is hidden", () => {
		const owed = articlePages().filter((page) => {
			const scopes = SCOPES.exec(read(page))?.[1]?.trim() ?? "";

			return scopes.length > 0 && scopes.split(",").length > 1;
		});

		expect(owed.length).toBeGreaterThan(0);

		const rendered = owed.filter((page) => read(page).includes(TABLE_OF_CONTENTS_WRAPPER_CLASS));

		expect(rendered.length).toBe(HIDES_CHROME ? 0 : owed.length);
	});

	it("hydrates an island on About alone among the prerendered pages, so no other page loads React, and on none while the chrome hides About", () => {
		const pages = prerenderedPages();

		expect(pages.length).toBeGreaterThan(1);
		expect(pages.filter((page) => read(page).includes(ISLAND))).toEqual(HIDES_CHROME ? [] : [pageAt("about")]);
	});

	it("renders the Manage cookies button in the footer of every prerendered page, before any script runs", () => {
		const pages = prerenderedPages();

		expect(pages.length).toBeGreaterThan(1);
		expect(pages.filter((page) => !COOKIE_CONSENT_BUTTON.test(read(page)))).toEqual([]);
	});

	it("names every inline script of every prerendered page in the policy by its digest, and allows no other", () => {
		const sources = scriptSourcesOf(read(join(CLIENT, "_headers")));
		const named = new Set(
			sources
				.filter((source) => source.startsWith(DIGEST_SOURCE_PREFIX))
				.map((source) => source.slice(DIGEST_SOURCE_PREFIX.length, -1)),
		);
		const pages = prerenderedPages();
		const unnamed = pages.flatMap((page) =>
			inlineScriptsOf(read(page))
				.filter((script) => !named.has(digest(script)))
				.map((script) => `${page}: ${script.trim().slice(0, 48)}`),
		);

		expect(
			inlineScriptsOf(
				'<script>a</script><script src="x"></script><script type="application/ld+json">{}</script><script type="module">b</script>',
			),
		).toEqual(["a", "b"]);
		expect(pages.length).toBeGreaterThan(1);
		expect(pages.filter((page) => inlineScriptsOf(read(page)).length < 2)).toEqual([]);
		expect(named.size).toBeGreaterThan(0);
		expect(sources).not.toContain("'unsafe-inline'");
		expect(unnamed).toEqual([]);
	});

	it("puts no inline event handler and no javascript: address on a prerendered page, which the policy would block", () => {
		const markup = (page: string) => read(page).replace(SCRIPT_AND_STYLE_ELEMENTS, "");
		const pages = prerenderedPages();

		expect(EVENT_HANDLER_ATTRIBUTE.test('<button type="button" onclick="go()">')).toBe(true);
		expect(EVENT_HANDLER_ATTRIBUTE.test('<a data-online="1" href="/on">')).toBe(false);
		expect(JAVASCRIPT_URL.test('<a href="javascript:void(0)">')).toBe(true);
		expect(pages.length).toBeGreaterThan(1);
		expect(pages.filter((page) => EVENT_HANDLER_ATTRIBUTE.test(markup(page)))).toEqual([]);
		expect(pages.filter((page) => JAVASCRIPT_URL.test(markup(page)))).toEqual([]);
	});

	it("keeps every line of the headers file within the length Cloudflare reads, past which the rule is dropped", () => {
		const lines = read(join(CLIENT, "_headers")).split("\n");

		expect(lines.length).toBeGreaterThan(1);
		expect(lines.filter((line) => line.length > HEADER_LINE_LIMIT).map((line) => line.slice(0, 40))).toEqual([]);
	});

	it("keeps the rendered article body, which set:html once replaced with nothing else", () => {
		expect(articlePages().filter((page) => !read(page).includes(`class="${ARTICLE_BODY_CLASS}"`))).toEqual([]);
	});

	it("lists every page in the sitemap except the ones robots.txt disallows", () => {
		const listed = locations();

		for (const route of ["/", "/about", "/articles", "/contact", "/projects", "/tags"]) {
			expect(`${route}: ${listed.includes(route)}`).toBe(`${route}: true`);
		}

		expect(listed.filter((route) => NOINDEX_ROUTES.some((noindex) => route.startsWith(noindex)))).toEqual([]);
	});

	it("tells a crawler not to index the routes robots.txt disallows, and to index the rest", () => {
		const robotsOf = (route: string) => ROBOTS_META.exec(read(pageAt(route)))?.[1];

		for (const route of NOINDEX_ROUTES) {
			expect(`${route}: ${robotsOf(route.slice(1))}`).toBe(`${route}: noindex, nofollow`);
		}

		for (const route of INDEXED_ROUTES) {
			expect(`/${route}: ${robotsOf(route)}`).toBe(`/${route}: index, follow`);
		}
	});

	it("declares the Open Graph locale of the language the page is written in", () => {
		for (const route of ["", "about", "articles", "privacy-policy"]) {
			const html = read(pageAt(route));
			const lang = HTML_LANG.exec(html)?.[1] ?? "";

			expect(lang.length).toBeGreaterThan(0);
			expect(`/${route}: ${OG_LOCALE.exec(html)?.[1]}`).toBe(`/${route}: ${lang.replace("-", "_")}`);
		}
	});

	it("agrees with itself about where a page lives, trailing slash included", () => {
		const feed = read(join(CLIENT, "rss.xml"));
		const [firstArticle] = sitemapUrls().filter((url) => new URL(url).pathname.startsWith("/articles/"));

		expect(firstArticle).toBeDefined();
		expect(feed).toContain(`<link>${firstArticle}</link>`);
		expect(feed).not.toContain(`${firstArticle}/</link>`);
	});

	it("skips no heading level the templates write and never puts a deeper one above a shallower one, an Article's body being its author's", () => {
		const outlines = [
			...["about", "privacy-policy", "terms-and-conditions"].map((route) => ({
				route,
				levels: headingLevels(read(pageAt(route))),
			})),
			...articlePages().map((page) => ({ route: page, levels: headingLevels(withoutArticleBody(read(page))) })),
		];

		expect(articlePages().filter((page) => withoutArticleBody(read(page)) === read(page))).toEqual([]);

		for (const { route, levels } of outlines) {
			const skips = levels.filter((level, index) => index > 0 && level - (levels[index - 1] as number) > 1);

			expect(`${route}: ${JSON.stringify(skips)}`).toBe(`${route}: []`);
			expect(`${route}: ${levels[0]}`).toBe(`${route}: 1`);
		}
	});

	it("leaves the contact page on demand, because a prerendered page can take no POST", () => {
		expect(existsSync(pageAt("contact"))).toBe(false);
	});

	it("serves no script origin the site does not use", () => {
		expect(read(join(CLIENT, "_headers"))).not.toContain("unpkg.com");
	});
});
