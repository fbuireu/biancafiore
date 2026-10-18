import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NOINDEX_ROUTES } from "@const/noindexRoutes";
import { MEDIA_FILE_PATH } from "@infrastructure/cms/media";
import { COOKIE_CONSENT_BUTTON_CLASS } from "@modules/core/components/cookieConsent/const";
import { type Document, Window } from "happy-dom";
import { afterAll, describe, expect, it } from "vitest";

const CLIENT = "dist/client";
const SERVER = "dist/server";
const SERVER_CHUNKS = join(SERVER, "chunks");
const IMAGE_CONFIG = /^var imageConfig = (\{[\s\S]*?^\});$/m;
const HEADING_TAG = /<h([1-6])[^>]*>/g;
const CONTENT_PAGES = ["", "about", "articles", "contact", "projects", "tags"];
const PRERENDERED_PAGES = ["privacy-policy", "terms-and-conditions"];
const HTML_LANG = /<html lang="([^"]*)"/;
const OG_LOCALE = /<meta property="og:locale" content="([^"]*)"\s*\/?>/;
const ROBOTS_META = /<meta name="robots" content="([^"]*)"\s*\/?>/;
const ISLAND = "<astro-island";
const COOKIE_CONSENT_BUTTON = new RegExp(`<button[^>]*class="[^"]*\\b${COOKIE_CONSENT_BUTTON_CLASS}\\b`);
const CONTENT_SECURITY_POLICY = /^\s+Content-Security-Policy: (.+)$/m;
const EXECUTABLE_SCRIPT_TYPES = new Set(["", "module", "text/javascript"]);
const DIGEST_SOURCE_PREFIX = "'sha256-";
const EVENT_HANDLER_ATTRIBUTE = /^on[a-z]+$/;
const URL_ATTRIBUTES = new Set(["href", "src", "action", "formaction"]);
const JAVASCRIPT_URL = /^\s*javascript:/i;
const HEADER_LINE_LIMIT = 2000;

interface ImageEntrypoint {
	entrypoint: string;
}

interface RemotePattern {
	hostname?: string;
	pathname?: string;
}

interface BuiltImageConfig {
	endpoint: ImageEntrypoint & { route: string };
	service: ImageEntrypoint;
	remotePatterns: RemotePattern[];
}

interface DeployedConfig {
	images?: { binding: string };
}

const read = (path: string): string => readFileSync(path, "utf-8");

const builtImageConfigs = (): BuiltImageConfig[] =>
	readdirSync(SERVER_CHUNKS)
		.filter((file) => file.endsWith(".mjs"))
		.flatMap((file) => IMAGE_CONFIG.exec(read(join(SERVER_CHUNKS, file)))?.[1] ?? [])
		.map((config) => JSON.parse(config) as BuiltImageConfig);

const browserWindow = new Window({
	settings: { disableJavaScriptEvaluation: true, disableJavaScriptFileLoading: true, disableCSSFileLoading: true },
});

const parse = (html: string): Document => new browserWindow.DOMParser().parseFromString(html, "text/html");

const pageAt = (route: string): string => join(CLIENT, route, "index.html");

const prerenderedPages = (): string[] =>
	readdirSync(CLIENT, { recursive: true, encoding: "utf-8" })
		.filter((path) => path.endsWith("index.html"))
		.map((path) => join(CLIENT, path));

const inlineScriptsOf = (html: string): string[] =>
	[...parse(html).querySelectorAll("script")]
		.filter((script) => !script.hasAttribute("src") && EXECUTABLE_SCRIPT_TYPES.has(script.getAttribute("type") ?? ""))
		.map((script) => script.textContent ?? "");

const blockedAttributesOf = (html: string): string[] =>
	[...parse(html).querySelectorAll("*")].flatMap((element) =>
		[...element.attributes]
			.filter(
				({ name, value }) =>
					EVENT_HANDLER_ATTRIBUTE.test(name) || (URL_ATTRIBUTES.has(name) && JAVASCRIPT_URL.test(value ?? "")),
			)
			.map(({ name }) => `<${element.localName} ${name}>`),
	);

const digest = (script: string): string => createHash("sha256").update(script, "utf8").digest("base64");

const scriptSourcesOf = (headers: string): string[] =>
	(CONTENT_SECURITY_POLICY.exec(headers)?.[1] ?? "")
		.split("; ")
		.find((directive) => directive.startsWith("script-src "))
		?.split(" ")
		.slice(1) ?? [];

const headingLevels = (html: string): number[] => [...html.matchAll(HEADING_TAG)].map(([, level]) => Number(level));

describe("the built output", () => {
	afterAll(() => browserWindow.happyDOM.close());

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
				'<script>a</script><script src="x"></script><script type="application/ld+json">{}</script><script type="module">b</script><SCRIPT>c</SCRIPT >',
			),
		).toEqual(["a", "b", "c"]);
		expect(pages.length).toBeGreaterThan(1);
		expect(pages.filter((page) => inlineScriptsOf(read(page)).length < 2)).toEqual([]);
		expect(named.size).toBeGreaterThan(0);
		expect(sources).not.toContain("'unsafe-inline'");
		expect(unnamed).toEqual([]);
	});

	it("puts no inline event handler and no javascript: address on a prerendered page, which the policy would block", () => {
		const pages = prerenderedPages();

		expect(blockedAttributesOf('<button type="button" onclick="go()">')).toEqual(["<button onclick>"]);
		expect(blockedAttributesOf('<BUTTON ONCLICK="go()">')).toEqual(["<button onclick>"]);
		expect(blockedAttributesOf('<a data-online="1" href="/on">')).toEqual([]);
		expect(blockedAttributesOf('<a href=" javascript:void(0)">')).toEqual(["<a href>"]);
		expect(blockedAttributesOf("<script>const markup = '<b onclick=\"go()\">';</script>")).toEqual([]);
		expect(pages.length).toBeGreaterThan(1);
		expect(pages.flatMap((page) => blockedAttributesOf(read(page)).map((found) => `${page}: ${found}`))).toEqual([]);
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

	it("answers /_image with EmDash's endpoint, which reads the media from R2 and transforms it through the Images binding the deployed config declares", () => {
		const configs = builtImageConfigs();
		const deployed = JSON.parse(read(join(SERVER, "wrangler.json"))) as DeployedConfig;

		expect(configs.length).toBeGreaterThan(0);

		for (const { endpoint, service, remotePatterns } of configs) {
			expect(endpoint).toEqual({ entrypoint: "@emdash-cms/cloudflare/image-endpoint", route: "/_image" });
			expect(service.entrypoint).toBe("@astrojs/cloudflare/image-service-workerd");
			expect(
				remotePatterns.filter(({ hostname, pathname }) => hostname && pathname === `${MEDIA_FILE_PATH}**`),
			).not.toEqual([]);
		}

		expect(deployed.images).toEqual({ binding: "IMAGES" });
	});

	it("serves no script origin the site does not use", () => {
		expect(read(join(CLIENT, "_headers"))).not.toContain("unpkg.com");
	});
});
