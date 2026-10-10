import { GOOGLE_ANALYTICS_ID } from "astro:env/client";
import { securityHeaders } from "@const/securityHeaders";
import { inlineScriptHashes } from "@modules/core/utils/inlineScripts";
import { afterEach, describe, expect, it, vi } from "vitest";
import { onRequest } from "./middleware";

const HTTPS_UPGRADE_DIRECTIVE = "upgrade-insecure-requests";
const HASHES = inlineScriptHashes(GOOGLE_ANALYTICS_ID);

const respond = () =>
	Promise.resolve(new Response("", { headers: { "Content-Type": "text/html" } })) as ReturnType<
		Parameters<typeof onRequest>[1]
	>;

const SITE = "https://biancafiore.me";

const headersOf = async (path = "/") => {
	const response = await onRequest({ url: new URL(path, SITE) } as Parameters<typeof onRequest>[0], respond);

	return (response as Response).headers;
};

const scriptSources = (headers: Headers) =>
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
		vi.stubEnv("DEV", true);

		expect((await headersOf()).get("Content-Security-Policy")).not.toContain(HTTPS_UPGRADE_DIRECTIVE);
	});

	it("keeps the https upgrade in production, where the whole point is to serve it", async () => {
		vi.stubEnv("DEV", false);

		expect((await headersOf()).get("Content-Security-Policy")).toContain(HTTPS_UPGRADE_DIRECTIVE);
	});

	it("touches no header but the policy, and leaves the rest of the policy alone in both modes", async () => {
		vi.stubEnv("DEV", true);

		const development = await headersOf();

		vi.stubEnv("DEV", false);

		const production = await headersOf();
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
		vi.stubEnv("DEV", false);

		const sources = scriptSources(await headersOf());

		expect(HASHES.length).toBeGreaterThan(0);
		expect(sources.filter((source) => source.startsWith("'sha256-"))).toStrictEqual(
			HASHES.map((hash) => `'sha256-${hash}'`),
		);
		expect(sources).not.toContain("'unsafe-inline'");
	});

	it("allows inline scripts in dev, where the toolchain writes its own", async () => {
		vi.stubEnv("DEV", true);

		expect(scriptSources(await headersOf())).toContain("'unsafe-inline'");
	});

	it("leaves EmDash's own routes to the headers EmDash sets, so the site's policy cannot break the admin", async () => {
		vi.stubEnv("DEV", false);

		const headers = await headersOf("/_emdash/admin");

		for (const header of Object.keys(securityHeaders({ isDevelopment: false, inlineScriptHashes: HASHES }))) {
			expect(`${header}: ${headers.get(header)}`).toBe(`${header}: null`);
		}
	});

	it("still sets the site's headers on a page whose path merely starts with the same letters", async () => {
		vi.stubEnv("DEV", false);

		expect((await headersOf("/_emdashboard")).get("Content-Security-Policy")).toBe(
			securityHeaders({ isDevelopment: false, inlineScriptHashes: HASHES })["Content-Security-Policy"],
		);
	});
});
