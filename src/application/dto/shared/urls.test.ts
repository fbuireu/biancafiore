import { describe, expect, it } from "vitest";
import { isSafeHref, isSafeImageUrl, isWebUrl } from "./urls";

describe("isSafeHref", () => {
	it.each([
		"/articles",
		"#top",
		"https://example.com",
		"http://example.com",
		"mailto:a@example.com",
		"tel:+34600000000",
	])("lets %s reach an href", (url) => {
		expect(isSafeHref(url)).toBe(true);
	});

	it.each([
		"javascript:alert(1)",
		"data:text/html,<script>alert(1)</script>",
		"//evil.example",
		"ftp://example.com",
		"",
	])("refuses %s, which an href would execute or send off-site", (url) => {
		expect(isSafeHref(url)).toBe(false);
	});
});

describe("isWebUrl", () => {
	it("takes http and https only", () => {
		expect(["https://example.com", "http://example.com", "mailto:a@example.com", "/about"].map(isWebUrl)).toEqual([
			true,
			true,
			false,
			false,
		]);
	});
});

describe("isSafeImageUrl", () => {
	it("takes a path on this origin or an http(s) URL, never a protocol-relative or script one", () => {
		expect(
			["/_emdash/api/media/file/card.jpg", "https://cdn.example/card.jpg", "//evil.example/x.jpg", "javascript:x"].map(
				isSafeImageUrl,
			),
		).toEqual([true, true, false, false]);
	});
});
