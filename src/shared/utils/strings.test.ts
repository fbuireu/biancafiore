import { deSlugify, escapeHtml, safeUrl, slugify } from "@shared/utils/strings";
import { describe, expect, it } from "vitest";

describe("slugify", () => {
	it("lowercases the text and joins words with a single hyphen", () => {
		expect(slugify("MiXeD CaSe Title")).toBe("mixed-case-title");
	});

	it("strips diacritics down to their base letters", () => {
		expect(slugify("Café Con Leche")).toBe("cafe-con-leche");
		expect(slugify("Ünïcödé Ãccents")).toBe("unicode-accents");
	});

	it("drops punctuation instead of turning it into a separator", () => {
		expect(slugify("What's New?")).toBe("whats-new");
		expect(slugify("2026: A Space Odyssey")).toBe("2026-a-space-odyssey");
	});

	it("collapses runs of whitespace, tabs and newlines into one hyphen", () => {
		expect(slugify("  Hello   World  ")).toBe("hello-world");
		expect(slugify("Hello\tWorld\nAgain")).toBe("hello-world-again");
	});

	it("collapses separators that punctuation left adjacent to each other", () => {
		expect(slugify("Hello - World")).toBe("hello-world");
		expect(slugify("a -- b")).toBe("a-b");
		expect(slugify("C++ & Rust")).toBe("c-rust");
		expect(slugify("Design — Systems")).toBe("design-systems");
	});

	it("trims surrounding whitespace and strips the hyphens left at either end", () => {
		expect(slugify("   spaced out   ")).toBe("spaced-out");
		expect(slugify("-leading and trailing-")).toBe("leading-and-trailing");
		expect(slugify("Trailing - ")).toBe("trailing");
	});

	it("strips the separators punctuation leaves at either end, not just the hyphens it was given", () => {
		expect(slugify("— Leading dash")).toBe("leading-dash");
		expect(slugify("Ends with an ampersand &")).toBe("ends-with-an-ampersand");
		expect(slugify("Chapter 1 :")).toBe("chapter-1");
	});

	it("keeps underscores because they count as word characters", () => {
		expect(slugify("snake_case value")).toBe("snake_case-value");
	});

	it("returns an empty string for empty or whitespace-only input", () => {
		expect(slugify("")).toBe("");
		expect(slugify("   ")).toBe("");
	});

	it("returns an empty string when no character survives the alphanumeric filter", () => {
		expect(slugify("日本語")).toBe("");
	});

	it("returns an empty string for a string made only of separators", () => {
		expect(slugify("---")).toBe("");
		expect(slugify(" - ")).toBe("");
	});

	it("leaves an already-slugified string unchanged", () => {
		expect(slugify(slugify("Hello, World!"))).toBe("hello-world");
		expect(slugify(slugify("- Dangling separators -"))).toBe("dangling-separators");
	});
});

describe("deSlugify", () => {
	it("turns hyphens into spaces and capitalises every word", () => {
		expect(deSlugify("hello-world")).toBe("Hello World");
	});

	it("capitalises a single-character slug", () => {
		expect(deSlugify("x")).toBe("X");
	});

	it("leaves digits alone and does not capitalise the letters that follow them", () => {
		expect(deSlugify("my-2nd-post")).toBe("My 2nd Post");
	});

	it("does not treat an underscore as a word boundary", () => {
		expect(deSlugify("snake_case-word")).toBe("Snake_case Word");
	});

	it("expands each hyphen of a run into its own space", () => {
		expect(deSlugify("a--b")).toBe("A  B");
	});

	it("turns leading and trailing hyphens into surrounding spaces", () => {
		expect(deSlugify("-lead-")).toBe(" Lead ");
	});

	it("returns an empty string for empty input", () => {
		expect(deSlugify("")).toBe("");
	});
});

describe("escapeHtml", () => {
	it.each([
		["&", "&amp;"],
		["<", "&lt;"],
		[">", "&gt;"],
		['"', "&quot;"],
		["'", "&#39;"],
	])("escapes %s as %s", (character, entity) => {
		expect(escapeHtml(character)).toBe(entity);
	});

	it("escapes every unsafe character in a single mixed string", () => {
		expect(escapeHtml(`<a href="x" title='y'>Tom & Jerry</a>`)).toBe(
			"&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;Tom &amp; Jerry&lt;/a&gt;",
		);
	});

	it("escapes every occurrence, not just the first", () => {
		expect(escapeHtml("a<b<c")).toBe("a&lt;b&lt;c");
	});

	it("escapes the ampersand of an existing entity exactly once", () => {
		expect(escapeHtml("&amp;")).toBe("&amp;amp;");
	});

	it("returns a string with no unsafe characters untouched", () => {
		expect(escapeHtml("Plain text, with punctuation — and accents: café 123")).toBe(
			"Plain text, with punctuation — and accents: café 123",
		);
	});

	it("returns an empty string for empty input", () => {
		expect(escapeHtml("")).toBe("");
	});
});

describe("safeUrl", () => {
	it.each(["http://example.com", "https://example.com/a", "mailto:ada@example.com", "tel:+34600000000"])(
		"lets %s through, because its scheme is one an editor may link to",
		(url) => {
			expect(safeUrl(url)).toBe(url);
		},
	);

	it.each([
		"javascript:alert(1)",
		"JavaScript:alert(1)",
		"  javascript:alert(1)  ",
		"data:text/html;base64,PHNjcmlwdD4=",
		"vbscript:msgbox(1)",
		"file:///etc/passwd",
	])("answers nothing at all for %s, so the attribute it feeds is emptied rather than trusted", (url) => {
		expect(safeUrl(url)).toBe("");
	});

	it("lets a relative link through, since it carries no scheme to refuse", () => {
		expect(safeUrl("/articles/a-piece")).toBe("/articles/a-piece");
	});

	it("lets a protocol-relative link through, for the same reason", () => {
		expect(safeUrl("//images.ctfassets.net/hero.jpg")).toBe("//images.ctfassets.net/hero.jpg");
	});

	it("escapes what it lets through, so a quote cannot close the attribute carrying it", () => {
		expect(safeUrl('https://example.com/?q="><script>')).toBe("https://example.com/?q=&quot;&gt;&lt;script&gt;");
	});

	it("trims before it decides, so padding cannot smuggle a scheme past the check", () => {
		expect(safeUrl("   https://example.com   ")).toBe("https://example.com");
	});

	it("refuses a scheme it does not know rather than allowing anything it has no rule for", () => {
		expect(safeUrl("ftp://example.com/file")).toBe("");
	});
});
