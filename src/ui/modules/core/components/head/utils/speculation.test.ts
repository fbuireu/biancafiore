import { CONTENT_ROUTES } from "@const/contentCache";
import { describe, expect, it } from "vitest";
import { PRERENDERED_PATHS, SPECULATION_RULES } from "./speculation";

describe("SPECULATION_RULES", () => {
	it("prerenders on a hover every page the Workers cache holds, so a prerender costs the Worker no render of its own", () => {
		expect(JSON.parse(SPECULATION_RULES)).toEqual({
			prerender: [{ where: { href_matches: PRERENDERED_PATHS }, eagerness: "moderate" }],
		});
	});

	it("matches an Article or a Tag by a wildcard where its route takes a slug", () => {
		expect(PRERENDERED_PATHS).toContain("/articles/*");
		expect(PRERENDERED_PATHS).toContain("/tags/*");
		expect(PRERENDERED_PATHS.filter((path) => path.includes("["))).toEqual([]);
	});

	it("prerenders no feed and no page outside the content routes, so the Contact page never loads reCAPTCHA or Calendly unseen", () => {
		expect(CONTENT_ROUTES.length).toBeGreaterThan(PRERENDERED_PATHS.length);
		expect(PRERENDERED_PATHS.filter((path) => path.endsWith(".xml"))).toEqual([]);
		expect(PRERENDERED_PATHS).not.toContain("/contact");
	});
});
