import type { AstroIntegration } from "astro";
import { afterEach, describe, expect, it, vi } from "vitest";
import { generateStaticHeaders } from "./generateStaticHeaders";

const writeFileSync = vi.hoisted(() => vi.fn());

vi.mock("node:fs", () => ({ writeFileSync }));

const HEADERS = {
	"X-Content-Type-Options": "nosniff",
	"Content-Security-Policy": "default-src 'self'; script-src 'self' 'sha256-abc='",
	"X-Frame-Options": "SAMEORIGIN",
};

const runBuildStart = () => {
	const integration = generateStaticHeaders(HEADERS) as AstroIntegration & {
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

	it("emits every header it is given, in the order it is given them, and nothing else", () => {
		const emitted = runBuildStart()
			.split("\n")
			.filter((line) => line.startsWith("  "))
			.map((line) => line.trim().split(": ").at(0));

		expect(emitted).toStrictEqual(Object.keys(HEADERS));
	});

	it("emits each header with the value it is given, so the two delivery paths carry what the caller built", () => {
		const emitted = runBuildStart();

		for (const [header, value] of Object.entries(HEADERS)) {
			expect(emitted).toContain(`  ${header}: ${value}`);
		}
	});
});
