import {
	badgeMarkup,
	isGreenHost,
	renderCarbonBadge,
	transferredBytes,
} from "@modules/core/components/carbonBadge/utils/carbon";
import { greenCheckDouble } from "@tests/doubles/network";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const entries = (navigation: number | undefined, resources: number[]) => {
	vi.spyOn(performance, "getEntriesByType").mockImplementation((type) =>
		type === "navigation"
			? ((navigation === undefined ? [] : [{ transferSize: navigation }]) as unknown as PerformanceEntry[])
			: (resources.map((transferSize) => ({ transferSize })) as unknown as PerformanceEntry[]),
	);
};

beforeEach(() => {
	document.body.innerHTML = '<div id="carbon-badge"></div>';
});

afterEach(() => {
	vi.restoreAllMocks();
	document.body.innerHTML = "";
});

describe("transferredBytes", () => {
	it("counts the document itself alongside every resource it pulled", () => {
		entries(1000, [200, 300]);

		expect(transferredBytes()).toBe(1500);
	});

	it("treats a resource the browser reported no size for as nothing, rather than as NaN", () => {
		entries(1000, [undefined as unknown as number, 500]);

		expect(transferredBytes()).toBe(1500);
	});

	it("answers zero when the browser reported no navigation entry at all", () => {
		entries(undefined, []);

		expect(transferredBytes()).toBe(0);
	});
});

describe("isGreenHost", () => {
	it("believes the Green Web Foundation when it says a host is green", async () => {
		greenCheckDouble({ green: true });

		await expect(isGreenHost("biancafiore.me")).resolves.toBe(true);
	});

	it("understates rather than overclaims when the check is unreachable", async () => {
		greenCheckDouble({ unreachable: true });

		await expect(isGreenHost("biancafiore.me")).resolves.toBe(false);
	});

	it("understates when the answer is not readable JSON, for the same reason", async () => {
		greenCheckDouble({ malformed: true });

		await expect(isGreenHost("biancafiore.me")).resolves.toBe(false);
	});

	it("asks about the host it was given", async () => {
		const check = greenCheckDouble({ green: false });

		await isGreenHost("example.test");

		expect(check.calls).toStrictEqual(["https://api.thegreenwebfoundation.org/api/v3/greencheck/example.test"]);
	});
});

describe("badgeMarkup", () => {
	it("links at the site origin the routes module resolves, not at a second literal", () => {
		expect(badgeMarkup({ grams: "0.21", isGreen: false })).toContain(
			"green-web-check/?url=https%3A%2F%2Fbiancafiore.test%2F",
		);
	});

	it("marks a green host with a recycling glyph, and leaves a grey one plain", () => {
		expect(badgeMarkup({ grams: "0.21", isGreen: true })).toContain("♻️ 0.21g");
		expect(badgeMarkup({ grams: "0.21", isGreen: false })).toContain(">\n        0.21g");
	});
});

describe("renderCarbonBadge", () => {
	it("writes nothing when the browser measured no transfer at all", async () => {
		entries(0, []);

		await renderCarbonBadge();

		expect(document.getElementById("carbon-badge")?.innerHTML).toBe("");
	});

	it("writes nothing when the page carries no badge to write into", async () => {
		document.body.innerHTML = "";
		entries(1000, []);
		greenCheckDouble({ green: true });

		await expect(renderCarbonBadge()).resolves.toBeUndefined();
	});

	it("prints a figure and a link once it has measured the page", async () => {
		entries(500_000, []);
		greenCheckDouble({ green: true });

		await renderCarbonBadge();

		expect(document.getElementById("carbon-badge")?.innerHTML).toMatch(/♻️ \d+\.\d{2}g CO₂\/visit/);
	});
});
