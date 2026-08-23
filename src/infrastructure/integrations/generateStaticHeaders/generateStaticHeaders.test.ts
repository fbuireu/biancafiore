import { SECURITY_HEADERS } from "@const/securityHeaders";
import { generateStaticHeaders } from "@infrastructure/integrations/generateStaticHeaders";
import type { AstroIntegration } from "astro";
import { afterEach, describe, expect, it, vi } from "vitest";

const writeFileSync = vi.hoisted(() => vi.fn());

vi.mock("node:fs", () => ({ writeFileSync }));

const runBuildStart = () => {
	const integration = generateStaticHeaders() as AstroIntegration & {
		hooks: { "astro:build:start": () => void };
	};

	integration.hooks["astro:build:start"]();

	return String(writeFileSync.mock.calls.at(0)?.[1] ?? "");
};

afterEach(() => {
	writeFileSync.mockReset();
});

describe("generateStaticHeaders", () => {
	it("writes the file Cloudflare reads, into the directory Astro copies verbatim", () => {
		runBuildStart();

		expect(writeFileSync.mock.calls.at(0)?.[0]).toBe("./public/_headers");
	});

	it("applies the rules to every path", () => {
		expect(runBuildStart().startsWith("/*\n")).toBe(true);
	});

	it("emits every security header the middleware sets, and nothing else", () => {
		const emitted = runBuildStart()
			.split("\n")
			.filter((line) => line.startsWith("  "))
			.map((line) => line.trim().split(": ").at(0));

		expect(emitted).toStrictEqual(Object.keys(SECURITY_HEADERS));
	});

	it("emits each header with the value the constant declares, so the two delivery paths cannot disagree", () => {
		const emitted = runBuildStart();

		for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
			expect(emitted).toContain(`  ${header}: ${value}`);
		}
	});
});
