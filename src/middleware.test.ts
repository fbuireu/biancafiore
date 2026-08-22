import { SECURITY_HEADERS, securityHeaders } from "@const/securityHeaders";
import { afterEach, describe, expect, it, vi } from "vitest";
import { onRequest } from "./middleware";

const HTTPS_UPGRADE_DIRECTIVE = "upgrade-insecure-requests";

const respond = () =>
	Promise.resolve(new Response("", { headers: { "Content-Type": "text/html" } })) as ReturnType<
		Parameters<typeof onRequest>[1]
	>;

const headersOf = async () => {
	const response = await onRequest({} as Parameters<typeof onRequest>[0], respond);

	return (response as Response).headers;
};

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("onRequest", () => {
	it("carries the https upgrade in the policy it starts from, or there is nothing to strip", () => {
		expect(SECURITY_HEADERS["Content-Security-Policy"]).toContain(HTTPS_UPGRADE_DIRECTIVE);
	});

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

		for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
			if (header === "Content-Security-Policy") continue;

			expect(`${header}: ${development.get(header)}`).toBe(`${header}: ${value}`);
			expect(`${header}: ${production.get(header)}`).toBe(`${header}: ${value}`);
		}

		expect(production.get("Content-Security-Policy")).toBe(securityHeaders()["Content-Security-Policy"]);
		expect(development.get("Content-Security-Policy")).toBe(
			securityHeaders({ isDevelopment: true })["Content-Security-Policy"],
		);
	});
});
