import { describe, expect, it } from "vitest";
import { securityHeaders } from "./securityHeaders";

const HTTPS_UPGRADE_DIRECTIVE = "upgrade-insecure-requests";
const HASHES = ["Zmlyc3QtaW5saW5lLXNjcmlwdA==", "c2Vjb25kLWlubGluZS1zY3JpcHQ="];

interface PolicyParams {
	isDevelopment: boolean;
	inlineScriptHashes?: readonly string[];
}

const policy = ({ isDevelopment, inlineScriptHashes = HASHES }: PolicyParams) =>
	securityHeaders({ isDevelopment, inlineScriptHashes })["Content-Security-Policy"] as string;

const directivesOf = (params: PolicyParams) => policy(params).split("; ");

const scriptSources = (params: PolicyParams) =>
	(directivesOf(params).find((directive) => directive.startsWith("script-src ")) ?? "").split(" ").slice(1);

describe("securityHeaders", () => {
	it("carries the https upgrade in production, where it is what the site wants", () => {
		expect(policy({ isDevelopment: false })).toContain(HTTPS_UPGRADE_DIRECTIVE);
	});

	it("drops it in development, because WebKit obeys it on localhost and loads nothing", () => {
		expect(policy({ isDevelopment: true })).not.toContain(HTTPS_UPGRADE_DIRECTIVE);
	});

	it("drops the directive rather than a substring, so the policy stays well formed", () => {
		expect(directivesOf({ isDevelopment: true })).not.toContain("");
		expect(policy({ isDevelopment: true }).endsWith(";")).toBe(false);
		expect(directivesOf({ isDevelopment: true })).toHaveLength(directivesOf({ isDevelopment: false }).length - 1);
	});

	it("leaves every directive but those two alone in both environments", () => {
		const aside = (directive: string) => directive !== HTTPS_UPGRADE_DIRECTIVE && !directive.startsWith("script-src ");

		expect(directivesOf({ isDevelopment: false }).filter(aside)).toStrictEqual(
			directivesOf({ isDevelopment: true }).filter(aside),
		);
	});

	it("changes no header but the policy between the two environments", () => {
		const { "Content-Security-Policy": _production, ...productionRest } = securityHeaders({
			isDevelopment: false,
			inlineScriptHashes: HASHES,
		});
		const { "Content-Security-Policy": _development, ...developmentRest } = securityHeaders({
			isDevelopment: true,
			inlineScriptHashes: HASHES,
		});

		expect(productionRest).toStrictEqual(developmentRest);
	});

	it("runs in production exactly the inline scripts it is handed, each named by its sha256 digest", () => {
		const sources = scriptSources({ isDevelopment: false });

		expect(sources.filter((source) => source.startsWith("'sha256-"))).toStrictEqual(
			HASHES.map((hash) => `'sha256-${hash}'`),
		);
	});

	it("keeps unsafe-inline, unsafe-eval and strict-dynamic out of the production script sources", () => {
		const sources = scriptSources({ isDevelopment: false });

		expect(sources).toContain("'self'");
		expect(sources).not.toContain("'unsafe-inline'");
		expect(sources).not.toContain("'unsafe-eval'");
		expect(sources).not.toContain("'strict-dynamic'");
	});

	it("allows no inline script at all in production when it is handed none", () => {
		const sources = scriptSources({ isDevelopment: false, inlineScriptHashes: [] });

		expect(sources).not.toContain("'unsafe-inline'");
		expect(sources.filter((source) => source.startsWith("'sha256-"))).toStrictEqual([]);
	});

	it("allows inline scripts in development, where the toolchain writes its own, and ignores the digests", () => {
		const sources = scriptSources({ isDevelopment: true });

		expect(sources).toContain("'unsafe-inline'");
		expect(sources.filter((source) => source.startsWith("'sha256-"))).toStrictEqual([]);
	});

	it("keeps the origins the page's third-party scripts load from beside the digests", () => {
		const sources = scriptSources({ isDevelopment: false });

		expect(sources).toContain("https://www.googletagmanager.com");
		expect(sources).toContain("https://www.google.com");
		expect(sources).toContain("https://static.cloudflareinsights.com");
	});
});
