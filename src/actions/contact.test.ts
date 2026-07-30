import { submitContact } from "@actions/contact";
import { Effect, Exit, Layer } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetSecrets, setSecret } from "../../tests/doubles/astroEnvServer";
import { databaseDouble, databaseError, emailDouble, emailError } from "../../tests/doubles/contactLayers";

const VALID_INPUT = {
	name: "Ada",
	email: "Ada+news@Example.com ",
	message: "Hello there",
	recaptcha: "token",
};

const recaptchaResponds = (body: { success: boolean; score?: number }) => {
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => ({ json: async () => body })),
	);
};

const run = ({
	database,
	email,
	input = VALID_INPUT,
}: {
	database: ReturnType<typeof databaseDouble>;
	email: ReturnType<typeof emailDouble>;
	input?: typeof VALID_INPUT;
}) => Effect.runPromiseExit(submitContact(input).pipe(Effect.provide(Layer.merge(database.layer, email.layer))));

beforeEach(() => {
	setSecret("GOOGLE_RECAPTCHA_SECRET_KEY", "secret");
	recaptchaResponds({ success: true, score: 0.9 });
});

afterEach(() => {
	resetSecrets();
	vi.unstubAllGlobals();
});

describe("submitContact", () => {
	it("sends the mail and persists the normalized address", async () => {
		const database = databaseDouble();
		const email = emailDouble({ id: "sent-1" });

		const exit = await run({ database, email });

		expect(Exit.isSuccess(exit)).toBe(true);
		expect(database.inserted).toHaveLength(1);
		expect(database.inserted[0]?.email).toBe("ada@example.com");
		expect(database.inserted[0]?.emailId).toBe("sent-1");
	});

	it("mails the address exactly as it was typed, alias included", async () => {
		const database = databaseDouble();
		const email = emailDouble();

		await run({ database, email });

		expect(email.sent[0]?.replyTo).toBe("Ada+news@Example.com");
	});

	it("still answers ok when the row cannot be written", async () => {
		const database = databaseDouble({ failInsertWith: databaseError("turso unreachable") });
		const email = emailDouble({ id: "sent-2" });

		const exit = await run({ database, email });

		expect(exit).toStrictEqual(Exit.succeed({ ok: true }));
		expect(database.inserted).toHaveLength(0);
	});

	it("fails without sending when the address already contacted", async () => {
		const database = databaseDouble({ duplicates: [{ email: "ada@example.com" }] });
		const email = emailDouble();

		const exit = await run({ database, email });

		expect(Exit.isFailure(exit)).toBe(true);
		expect(email.sent).toHaveLength(0);
	});

	it("fails without persisting when the mail cannot be sent", async () => {
		const database = databaseDouble();
		const email = emailDouble({ failWith: emailError("resend down") });

		const exit = await run({ database, email });

		expect(Exit.isFailure(exit)).toBe(true);
		expect(database.inserted).toHaveLength(0);
	});

	it("rejects a malformed payload before spending a reCAPTCHA call", async () => {
		const database = databaseDouble();
		const email = emailDouble();

		const exit = await run({ database, email, input: { ...VALID_INPUT, email: "not-an-email" } });

		expect(Exit.isFailure(exit)).toBe(true);
		expect(fetch).not.toHaveBeenCalled();
	});

	it("rejects a reCAPTCHA score below the threshold", async () => {
		recaptchaResponds({ success: true, score: 0.4 });

		const database = databaseDouble();
		const email = emailDouble();

		const exit = await run({ database, email });

		expect(Exit.isFailure(exit)).toBe(true);
		expect(email.sent).toHaveLength(0);
	});

	it("accepts a reCAPTCHA score on the threshold", async () => {
		recaptchaResponds({ success: true, score: 0.5 });

		const database = databaseDouble();
		const email = emailDouble();

		const exit = await run({ database, email });

		expect(Exit.isSuccess(exit)).toBe(true);
	});
});
