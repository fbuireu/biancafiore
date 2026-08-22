import {
	badgeMarkup,
	isGreenHost,
	renderCarbonBadge,
	resetTransferredBytes,
	transferredBytes,
} from "@modules/core/components/carbonBadge/utils/carbon";
import { greenCheckDouble } from "@tests/doubles/network";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface EntriesParams {
	navigation?: number;
	resources: number[];
}

const entries = ({ navigation, resources }: EntriesParams) => {
	vi.spyOn(performance, "getEntriesByType").mockImplementation((type) =>
		type === "navigation"
			? ((navigation === undefined ? [] : [{ transferSize: navigation }]) as unknown as PerformanceEntry[])
			: (resources.map((transferSize) => ({ transferSize })) as unknown as PerformanceEntry[]),
	);
};

beforeEach(() => {
	document.body.innerHTML = '<div id="carbon-badge"></div>';
	resetTransferredBytes();
});

afterEach(() => {
	vi.restoreAllMocks();
	document.body.innerHTML = "";
});

describe("transferredBytes", () => {
	it("counts the document itself alongside every resource it pulled", () => {
		entries({ navigation: 1000, resources: [200, 300] });

		expect(transferredBytes()).toBe(1500);
	});

	it("treats a resource the browser reported no size for as nothing, rather than as NaN", () => {
		entries({ navigation: 1000, resources: [undefined as unknown as number, 500] });

		expect(transferredBytes()).toBe(1500);
	});

	it("answers zero when the browser reported no navigation entry at all", () => {
		entries({ resources: [] });

		expect(transferredBytes()).toBe(0);
	});
});

describe("transferredBytes across a client-side navigation", () => {
	it("counts only what the second page pulled, not the whole session", () => {
		entries({ navigation: 1000, resources: [200] });
		expect(transferredBytes()).toBe(1200);

		entries({ navigation: 1000, resources: [200, 300, 400] });
		expect(transferredBytes()).toBe(700);
	});

	it("counts the document once, since ClientRouter never replaces it", () => {
		entries({ navigation: 1000, resources: [] });
		transferredBytes();
		entries({ navigation: 1000, resources: [50] });

		expect(transferredBytes()).toBe(50);
	});

	it("answers nothing for a navigation that pulled nothing new", () => {
		entries({ navigation: 1000, resources: [200] });
		transferredBytes();

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
		entries({ navigation: 0, resources: [] });

		await renderCarbonBadge();

		expect(document.getElementById("carbon-badge")?.innerHTML).toBe("");
	});

	it("writes nothing when the page carries no badge to write into", async () => {
		document.body.innerHTML = '<p id="untouched">nothing to do with the badge</p>';
		entries({ navigation: 1000, resources: [] });
		greenCheckDouble({ green: true });

		await renderCarbonBadge();

		expect(document.body.innerHTML).toBe('<p id="untouched">nothing to do with the badge</p>');
	});

	it("prints a figure and a link once it has measured the page", async () => {
		entries({ navigation: 500_000, resources: [] });
		greenCheckDouble({ green: true });

		await renderCarbonBadge();

		expect(document.getElementById("carbon-badge")?.innerHTML).toMatch(/♻️ \d+\.\d{2}g CO₂\/visit/);
	});
});
