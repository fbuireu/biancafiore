import { SECURITY_HEADERS, securityHeaders } from "@const/securityHeaders";
import { describe, expect, it } from "vitest";

const HTTPS_UPGRADE_DIRECTIVE = "upgrade-insecure-requests";

const policy = (isDevelopment: boolean) => securityHeaders({ isDevelopment })["Content-Security-Policy"] as string;

describe("securityHeaders", () => {
	it("carries the https upgrade in production, where it is what the site wants", () => {
		expect(policy(false)).toContain(HTTPS_UPGRADE_DIRECTIVE);
	});

	it("drops it in development, because WebKit obeys it on localhost and loads nothing", () => {
		expect(policy(true)).not.toContain(HTTPS_UPGRADE_DIRECTIVE);
	});

	it("drops the directive rather than a substring, so the policy stays well formed", () => {
		expect(policy(true).split("; ")).not.toContain("");
		expect(policy(true).endsWith(";")).toBe(false);
	});

	it("leaves every other directive alone in both environments", () => {
		const production = policy(false).split("; ");
		const development = policy(true).split("; ");

		expect(production.filter((directive) => directive !== HTTPS_UPGRADE_DIRECTIVE)).toStrictEqual(development);
	});

	it("changes no header but the policy between the two environments", () => {
		const { "Content-Security-Policy": _production, ...productionRest } = securityHeaders();
		const { "Content-Security-Policy": _development, ...developmentRest } = securityHeaders({ isDevelopment: true });

		expect(productionRest).toStrictEqual(developmentRest);
	});

	it("is the production policy that the build-time _headers file is generated from", () => {
		expect(SECURITY_HEADERS).toStrictEqual(securityHeaders());
	});
});
