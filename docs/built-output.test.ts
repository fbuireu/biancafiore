import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NOINDEX_ROUTES } from "@const/noindexRoutes";
import { COOKIE_CONSENT_BUTTON_CLASS } from "@modules/core/components/cookieConsent/const";
import { describe, expect, it } from "vitest";

const CLIENT = "dist/client";
const HEADING_TAG = /<h([1-6])[^>]*>/g;
const CONTENT_PAGES = ["", "about", "articles", "contact", "projects", "tags"];
const PRERENDERED_PAGES = ["privacy-policy", "terms-and-conditions"];
const HTML_LANG = /<html lang="([^"]*)"/;
const OG_LOCALE = /<meta property="og:locale" content="([^"]*)"\s*\/?>/;
const ROBOTS_META = /<meta name="robots" content="([^"]*)"\s*\/?>/;
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

const headingLevels = (html: string): number[] => [...html.matchAll(HEADING_TAG)].map(([, level]) => Number(level));

describe("the built output", () => {
	it("exists, because every assertion below reads it rather than the source", () => {
		expect(
			existsSync(CLIENT),
			"run `pnpm build` first: these assertions cover defects no source-level tool can see",
		).toBe(true);
	});

	it("hydrates no island on a prerendered page, so none of them loads React", () => {
		const pages = prerenderedPages();

		expect(pages.length).toBeGreaterThan(1);
		expect(pages.filter((page) => read(page).includes(ISLAND))).toEqual([]);
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

	it("tells a crawler not to index the routes robots.txt disallows", () => {
		const robotsOf = (route: string) => ROBOTS_META.exec(read(pageAt(route)))?.[1];

		for (const route of NOINDEX_ROUTES) {
			expect(`${route}: ${robotsOf(route.slice(1))}`).toBe(`${route}: noindex, nofollow`);
		}
	});

	it("declares the Open Graph locale of the language the page is written in", () => {
		for (const route of PRERENDERED_PAGES) {
			const html = read(pageAt(route));
			const lang = HTML_LANG.exec(html)?.[1] ?? "";

			expect(lang.length).toBeGreaterThan(0);
			expect(`/${route}: ${OG_LOCALE.exec(html)?.[1]}`).toBe(`/${route}: ${lang.replace("-", "_")}`);
		}
	});

	it("prerenders no page that reads content, since the build cannot reach the database it lives in", () => {
		expect(CONTENT_PAGES.filter((route) => existsSync(pageAt(route)))).toEqual([]);
		expect(["rss.xml", "sitemap.xml", "sitemap-index.xml"].filter((file) => existsSync(join(CLIENT, file)))).toEqual(
			[],
		);
	});

	it("prerenders the legal pages, which read none", () => {
		expect(PRERENDERED_PAGES.filter((route) => !existsSync(pageAt(route)))).toEqual([]);
	});

	it("skips no heading level and never puts a deeper heading above a shallower one", () => {
		const outlines = PRERENDERED_PAGES.map((route) => ({ route, levels: headingLevels(read(pageAt(route))) }));

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
