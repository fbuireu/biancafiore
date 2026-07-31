import { createEmail, normalizeEmail } from "@infrastructure/utils/email";
import { describe, expect, it } from "vitest";

const SUBMISSION = {
	name: "Ada",
	email: "ada@example.com",
	message: "Hello there",
};

const EN_GB_TIMESTAMP = /\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}/;
const MAILTO_SUBJECT = /mailto:[^"']*\?subject=([^"'&]+)/;

describe("normalizeEmail", () => {
	it("lowercases the whole address", () => {
		expect(normalizeEmail("Ada@Example.COM")).toBe("ada@example.com");
	});

	it("drops the whitespace a browser autofill leaves around the address", () => {
		expect(normalizeEmail("  ada@example.com\n")).toBe("ada@example.com");
	});

	it("strips the plus alias so an alias and its owner are the same person", () => {
		expect(normalizeEmail("ada+newsletter@example.com")).toBe("ada@example.com");
	});

	it("strips everything from the first plus to the at sign, however many pluses there are", () => {
		expect(normalizeEmail("ada+news+2026@example.com")).toBe("ada@example.com");
	});

	it("drops an empty alias, a bare trailing plus", () => {
		expect(normalizeEmail("ada+@example.com")).toBe("ada@example.com");
	});

	it("leaves an address without an alias untouched beyond casing and trimming", () => {
		expect(normalizeEmail("ada@example.com")).toBe("ada@example.com");
	});

	it("does not touch a plus that sits in the domain, where it is not an alias", () => {
		expect(normalizeEmail("ada@ex+ample.com")).toBe("ada@ex+ample.com");
	});

	it("applies trimming, lowercasing and alias stripping together", () => {
		expect(normalizeEmail("  Ada+News@Example.com  ")).toBe("ada@example.com");
	});
});

describe("createEmail", () => {
	it("puts the visitor's name, address and message into the html body", async () => {
		const { html } = await createEmail(SUBMISSION);

		expect(html).toContain("Ada");
		expect(html).toContain("ada@example.com");
		expect(html).toContain("Hello there");
	});

	it("escapes markup in the message instead of letting it render", async () => {
		const { html } = await createEmail({ ...SUBMISSION, message: "<script>alert('xss')</script>" });

		expect(html).not.toContain("<script>alert");
		expect(html).toContain("&lt;script&gt;");
	});

	it("percent encodes the reply subject, so no raw space reaches the mailto href", async () => {
		const { html } = await createEmail(SUBMISSION);

		expect(html).toContain(
			"mailto:ada@example.com?subject=Re%3A%20Web%20contact%20form%20submission%20from%20biancafiore.me",
		);
	});

	it("keeps the whole subject line readable once the mail client decodes it", async () => {
		const { html } = await createEmail(SUBMISSION);
		const [, subject] = html.match(MAILTO_SUBJECT) ?? [];

		expect(subject).toBeDefined();
		expect(decodeURIComponent(subject as string)).toBe("Re: Web contact form submission from biancafiore.me");
	});

	it("keeps the alias in the reply link, because the mail must reach the address as typed", async () => {
		const { html } = await createEmail({ ...SUBMISSION, email: "Ada+news@Example.com" });

		expect(html).toContain("mailto:Ada+news@Example.com?subject=");
	});

	it("stamps the message with a day first, twenty four hour timestamp", async () => {
		const { html } = await createEmail(SUBMISSION);

		expect(html).toMatch(EN_GB_TIMESTAMP);
		expect(html).not.toMatch(/\d{2}:\d{2}:\d{2}\s?(AM|PM)/);
	});

	it("returns a plain text twin that carries the same content without any markup", async () => {
		const { text } = await createEmail(SUBMISSION);

		expect(text).toContain("Ada");
		expect(text).toContain("ada@example.com");
		expect(text).toContain("Hello there");
		expect(text).not.toMatch(/<\/?[a-z]+[\s>]/i);
	});
});
