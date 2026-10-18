import { GOOGLE_ANALYTICS_ID } from "astro:env/client";
import { IMAGE_ROUTE } from "@const/contentCache";
import { securityHeaders } from "@const/securityHeaders";
import { inlineScriptHashes } from "@modules/core/utils/inlineScripts";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { onRequest } from "./middleware";

const HTTPS_UPGRADE_DIRECTIVE = "upgrade-insecure-requests";
const HASHES = inlineScriptHashes(GOOGLE_ANALYTICS_ID);

const respond = (): Promise<Response> =>
	Promise.resolve(new Response("", { headers: { "Content-Type": "text/html" } })) as ReturnType<
		Parameters<typeof onRequest>[1]
	>;

const SITE = "https://biancafiore.me";

interface HeadersOfParams {
	isDevelopment: boolean;
	path?: string;
}

const headersOf = async ({ isDevelopment, path = "/" }: HeadersOfParams): Promise<Headers> => {
	vi.stubEnv("DEV", isDevelopment);
	vi.resetModules();

	const { onRequest } = await import("./middleware");
	const response = await onRequest({ url: new URL(path, SITE) } as Parameters<typeof onRequest>[0], respond);

	return (response as Response).headers;
};

interface CacheCallsOfParams {
	path: string;
	status: number;
}

const cacheCallsOf = async ({ path, status }: CacheCallsOfParams): Promise<unknown[]> => {
	const calls: unknown[] = [];
	const { onRequest } = await import("./middleware");
	const cache = {
		set: (input: unknown) => {
			calls.push(input);
		},
	};

	await onRequest(
		{ url: new URL(path, SITE), cache } as Parameters<typeof onRequest>[0],
		() => Promise.resolve(new Response(null, { status })) as ReturnType<Parameters<typeof onRequest>[1]>,
	);

	return calls;
};

const scriptSources = (headers: Headers): string[] =>
	(headers.get("Content-Security-Policy") ?? "")
		.split("; ")
		.find((directive) => directive.startsWith("script-src "))
		?.split(" ")
		.slice(1) ?? [];

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("onRequest", () => {
	it("strips the https upgrade in dev, which is the directive WebKit obeys on localhost", async () => {
		expect((await headersOf({ isDevelopment: true })).get("Content-Security-Policy")).not.toContain(
			HTTPS_UPGRADE_DIRECTIVE,
		);
	});

	it("keeps the https upgrade in production, where the whole point is to serve it", async () => {
		expect((await headersOf({ isDevelopment: false })).get("Content-Security-Policy")).toContain(
			HTTPS_UPGRADE_DIRECTIVE,
		);
	});

	it("touches no header but the policy, and leaves the rest of the policy alone in both modes", async () => {
		const development = await headersOf({ isDevelopment: true });

		const production = await headersOf({ isDevelopment: false });
		const productionHeaders = securityHeaders({ isDevelopment: false, inlineScriptHashes: HASHES });
		const developmentHeaders = securityHeaders({ isDevelopment: true, inlineScriptHashes: HASHES });

		for (const [header, value] of Object.entries(productionHeaders)) {
			if (header === "Content-Security-Policy") continue;

			expect(`${header}: ${development.get(header)}`).toBe(`${header}: ${value}`);
			expect(`${header}: ${production.get(header)}`).toBe(`${header}: ${value}`);
		}

		expect(production.get("Content-Security-Policy")).toBe(productionHeaders["Content-Security-Policy"]);
		expect(development.get("Content-Security-Policy")).toBe(developmentHeaders["Content-Security-Policy"]);
	});

	it("runs in production the inline scripts the pages render, each by its digest, and no other", async () => {
		const sources = scriptSources(await headersOf({ isDevelopment: false }));

		expect(HASHES.length).toBeGreaterThan(0);
		expect(sources.filter((source) => source.startsWith("'sha256-"))).toStrictEqual(
			HASHES.map((hash) => `'sha256-${hash}'`),
		);
		expect(sources).not.toContain("'unsafe-inline'");
	});

	it("allows inline scripts in dev, where the toolchain writes its own", async () => {
		expect(scriptSources(await headersOf({ isDevelopment: true }))).toContain("'unsafe-inline'");
	});

	it("leaves EmDash's own routes to the headers EmDash sets, so the site's policy cannot break the admin", async () => {
		const headers = await headersOf({ isDevelopment: false, path: "/_emdash/admin" });

		for (const header of Object.keys(securityHeaders({ isDevelopment: false, inlineScriptHashes: HASHES }))) {
			expect(`${header}: ${headers.get(header)}`).toBe(`${header}: null`);
		}
	});

	it("keeps an image answer that is not a 200 out of the route cache, because EmDash's 404 opt-out skips /_image and a refused transform would otherwise be stored for a day", async () => {
		for (const status of [304, 404, 500]) {
			expect(`${status}: ${JSON.stringify(await cacheCallsOf({ path: IMAGE_ROUTE, status }))}`).toBe(
				`${status}: [false]`,
			);
		}
	});

	it("leaves a resized image to its route rule, so the Workers cache stores it", async () => {
		expect(await cacheCallsOf({ path: IMAGE_ROUTE, status: 200 })).toEqual([]);
	});

	it("leaves the route cache of every other path alone, whatever it answers", async () => {
		expect(await cacheCallsOf({ path: "/articles", status: 500 })).toEqual([]);
		expect(await cacheCallsOf({ path: `${IMAGE_ROUTE}s`, status: 404 })).toEqual([]);
	});

	it("still sets the site's headers on a page whose path merely starts with the same letters", async () => {
		expect((await headersOf({ isDevelopment: false, path: "/_emdashboard" })).get("Content-Security-Policy")).toBe(
			securityHeaders({ isDevelopment: false, inlineScriptHashes: HASHES })["Content-Security-Policy"],
		);
	});
});
