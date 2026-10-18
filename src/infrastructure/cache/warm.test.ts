import { describe, expect, it } from "vitest";
import { sitemapPaths, WARM_BATCH, WARM_CONCURRENCY, WARM_FALLBACK_INTERVAL, type WarmStore, warmCache } from "./warm";

const ORIGIN = "https://biancafiore.me";
const NOW = 1_800_000_000_000;
const ARTICLE_COUNT = WARM_BATCH + 5;
const ARTICLE_PATHS = Array.from({ length: ARTICLE_COUNT }, (_, index) => `/articles/article-${index}`);
const SITEMAP = `<?xml version="1.0"?><urlset>${["/", "/contact", ...ARTICLE_PATHS, "/"]
	.map((path) => `<url><loc>${ORIGIN}${path}</loc></url>`)
	.join("")}</urlset>`;

interface FakeStore extends WarmStore {
	saved: Map<string, string>;
}

const storeWith = (initial?: unknown): FakeStore => {
	const saved = new Map<string, string>();

	if (initial !== undefined) saved.set("cache-warm", typeof initial === "string" ? initial : JSON.stringify(initial));

	return {
		saved,
		get: async (key) => saved.get(key) ?? null,
		put: async (key, value) => {
			saved.set(key, value);
		},
	};
};

interface FakeOrigin {
	requested: Request[];
	fetch: (request: Request) => Promise<Response>;
}

interface OriginWithParams {
	probeStatus?: string;
	failing?: string;
}

const originWith = ({ probeStatus, failing }: OriginWithParams): FakeOrigin => {
	const requested: Request[] = [];

	return {
		requested,
		fetch: async (request) => {
			requested.push(request);

			const { pathname, search } = new URL(request.url);

			if (pathname === failing) throw new Error("render failed");
			if (search === "?warm") {
				return new Response(SITEMAP, { headers: probeStatus ? { "cf-cache-status": probeStatus } : {} });
			}

			return new Response("<html></html>");
		},
	};
};

const pagesOf = (origin: FakeOrigin): string[] =>
	origin.requested.map(({ url }) => new URL(url)).flatMap(({ pathname, search }) => (search ? [] : [pathname]));

const stateOf = (store: FakeStore): unknown => JSON.parse(store.saved.get("cache-warm") ?? "null");

describe("sitemapPaths", () => {
	it("answers every page the sitemap lists once, as a path, and leaves out the contact page the cache never holds", () => {
		const paths = sitemapPaths(SITEMAP);

		expect(paths).toEqual(["/", ...ARTICLE_PATHS]);
	});
});

describe("warmCache", () => {
	it("asks for nothing but its probe while the probe is a hit and no sweep is under way", async () => {
		const origin = originWith({ probeStatus: "HIT" });
		const store = storeWith();

		await warmCache({ fetch: origin.fetch, store, origin: ORIGIN, now: NOW });

		expect(origin.requested.map(({ url }) => url)).toEqual([`${ORIGIN}/sitemap.xml?warm`]);
		expect(store.saved.size).toBe(0);
	});

	it("starts a sweep when the probe misses, since a deploy or a purge emptied the cache, and asks for the first batch as a reader would", async () => {
		const origin = originWith({ probeStatus: "MISS" });
		const store = storeWith();

		await warmCache({ fetch: origin.fetch, store, origin: ORIGIN, now: NOW });

		expect(pagesOf(origin)).toEqual(["/", ...ARTICLE_PATHS].slice(0, WARM_BATCH));
		expect(origin.requested.every((request) => request.headers.get("accept") === "text/html")).toBe(true);
		expect(stateOf(store)).toEqual({ paths: ["/", ...ARTICLE_PATHS], next: WARM_BATCH, startedAt: NOW });
	});

	it("carries a sweep on from where the last tick left it while the probe is a hit", async () => {
		const paths = ["/", ...ARTICLE_PATHS];
		const origin = originWith({ probeStatus: "HIT" });
		const store = storeWith({ paths, next: WARM_BATCH, startedAt: NOW });

		await warmCache({ fetch: origin.fetch, store, origin: ORIGIN, now: NOW + 60_000 });

		expect(pagesOf(origin)).toEqual(paths.slice(WARM_BATCH));
		expect(stateOf(store)).toEqual({ paths, next: paths.length, startedAt: NOW });
	});

	it("starts over when the probe misses in the middle of a sweep, because a publish purged what it had warmed", async () => {
		const origin = originWith({ probeStatus: "EXPIRED" });
		const store = storeWith({ paths: ["/old"], next: 0, startedAt: NOW - 60_000 });

		await warmCache({ fetch: origin.fetch, store, origin: ORIGIN, now: NOW });

		expect(pagesOf(origin)[0]).toBe("/");
		expect(stateOf(store)).toMatchObject({ next: WARM_BATCH, startedAt: NOW });
	});

	it("sweeps on a timer when the probe carries no cache status, and not again before the interval runs out", async () => {
		const done = { paths: ["/"], next: 1, startedAt: NOW };
		const recent = originWith({});
		const due = originWith({});

		await warmCache({ fetch: recent.fetch, store: storeWith(done), origin: ORIGIN, now: NOW + 60_000 });
		await warmCache({ fetch: due.fetch, store: storeWith(done), origin: ORIGIN, now: NOW + WARM_FALLBACK_INTERVAL });

		expect(pagesOf(recent)).toEqual([]);
		expect(pagesOf(due)).toEqual(["/", ...ARTICLE_PATHS].slice(0, WARM_BATCH));
	});

	it("keeps sweeping past a page that fails to render, so one broken page cannot leave the rest cold", async () => {
		const failing = originWith({ probeStatus: "MISS", failing: ARTICLE_PATHS[0] });
		const store = storeWith();

		await warmCache({ fetch: failing.fetch, store, origin: ORIGIN, now: NOW });

		expect(pagesOf(failing)).toHaveLength(WARM_BATCH);
		expect(stateOf(store)).toMatchObject({ next: WARM_BATCH });
	});

	it("reads a stored state it cannot parse as no sweep at all", async () => {
		const origin = originWith({ probeStatus: "HIT" });

		await warmCache({ fetch: origin.fetch, store: storeWith("{not json"), origin: ORIGIN, now: NOW });

		expect(pagesOf(origin)).toEqual([]);
	});

	it("reads a stored state of another shape as no sweep at all, rather than walking paths it cannot trust", async () => {
		const origin = originWith({ probeStatus: "HIT" });

		await warmCache({ fetch: origin.fetch, store: storeWith({ paths: "/", next: -1 }), origin: ORIGIN, now: NOW });

		expect(pagesOf(origin)).toEqual([]);
	});

	it("asks for a batch a few pages at a time, so a cold sweep does not wake the Worker for every page at once", () => {
		expect(WARM_CONCURRENCY).toBeLessThan(WARM_BATCH);
		expect(WARM_BATCH).toBeLessThan(50);
	});
});
