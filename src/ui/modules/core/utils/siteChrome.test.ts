import { afterEach, describe, expect, it, vi } from "vitest";
import type { SiteChrome } from "./siteChrome";

const at = (pathname: string): URL => new URL(pathname, "https://biancafiore.test");

const siteChromeWith = async (hideChrome: boolean): Promise<(url: URL) => SiteChrome> => {
	vi.doMock("astro:env/client", async () => ({
		...(await vi.importActual<typeof import("astro:env/client")>("astro:env/client")),
		HIDE_CHROME: hideChrome,
	}));

	return (await import("./siteChrome")).siteChrome;
};

afterEach(() => {
	vi.resetModules();
	vi.doUnmock("astro:env/client");
});

describe("siteChrome", () => {
	it("shows every piece of chrome and the real page when the site is open", async () => {
		const siteChrome = await siteChromeWith(false);

		expect(siteChrome(at("/about"))).toEqual({
			showsHeader: true,
			showsBreadcrumbs: true,
			servesRealContent: true,
		});
	});

	it("hides the header and the breadcrumbs together", async () => {
		const siteChrome = await siteChromeWith(true);
		const { showsHeader, showsBreadcrumbs } = siteChrome(at("/articles/a-story"));

		expect([showsHeader, showsBreadcrumbs]).toEqual([false, false]);
	});

	it.each(["/articles", "/articles/a-story", "/tags", "/tags/seo", "/terms-and-conditions", "/privacy-policy"])(
		"still serves the writing at %s while the site is hidden",
		async (pathname) => {
			const siteChrome = await siteChromeWith(true);

			expect(siteChrome(at(pathname)).servesRealContent).toBe(true);
		},
	);

	it.each(["/404", "/500"])("still serves the error page at %s while the site is hidden", async (pathname) => {
		const siteChrome = await siteChromeWith(true);

		expect(siteChrome(at(pathname)).servesRealContent).toBe(true);
	});

	it.each(["/", "/about", "/contact", "/projects"])(
		"replaces %s with the placeholder while hidden",
		async (pathname) => {
			const siteChrome = await siteChromeWith(true);

			expect(siteChrome(at(pathname)).servesRealContent).toBe(false);
		},
	);

	it.each(["/tags-manifesto", "/articles-about-me"])(
		"matches whole path segments, so %s stays hidden for merely sharing a prefix",
		async (pathname) => {
			const siteChrome = await siteChromeWith(true);

			expect(siteChrome(at(pathname)).servesRealContent).toBe(false);
		},
	);
});
