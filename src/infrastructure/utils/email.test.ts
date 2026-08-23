import { createEmail } from "@infrastructure/utils/email";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SUBMISSION = {
	name: "Ada",
	email: "ada@example.com",
	message: "Hello there",
};

beforeEach(() => {
	vi.useFakeTimers({ toFake: ["Date"] });
});

afterEach(() => {
	vi.useRealTimers();
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

	it("keeps the alias in the reply link, because the mail must reach the address as typed", async () => {
		const { html } = await createEmail({ ...SUBMISSION, email: "Ada+news@Example.com" });

		expect(html).toContain("mailto:Ada+news@Example.com?subject=");
	});

	it("stamps the message with a day first, twenty four hour timestamp", async () => {
		vi.setSystemTime(new Date(2026, 2, 25, 15, 4, 5));

		const { html } = await createEmail(SUBMISSION);

		expect(html).toContain("25/03/2026, 15:04:05");
	});

	it("returns a plain text twin that carries the same content without any markup", async () => {
		const { text } = await createEmail(SUBMISSION);

		expect(text).toContain("Ada");
		expect(text).toContain("ada@example.com");
		expect(text).toContain("Hello there");
		expect(text).not.toMatch(/<\/?[a-z]+[\s>]/i);
	});
});
