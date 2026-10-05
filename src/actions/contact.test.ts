import type { DatabaseError } from "@infrastructure/errors";
import { resetSecrets, setSecret } from "@tests/doubles/astroEnvServer";
import {
	contactRow,
	databaseDouble,
	databaseError,
	emailDouble,
	emailError,
	loggerDouble,
} from "@tests/doubles/contactLayers";
import { type RecaptchaDoubleParams, recaptchaDouble } from "@tests/doubles/network";
import { failureOf } from "@tests/helpers/exit";
import { Effect, Exit, Layer } from "effect";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { submitContact } from "./contact";

const VALID_INPUT = {
	name: "Ada",
	email: "Ada+news@Example.com ",
	message: "Hello there",
	recaptcha: "token",
};

const recaptchaResponds = (verdict: RecaptchaDoubleParams) => recaptchaDouble(verdict);

const log = loggerDouble();

interface RunParams {
	database: ReturnType<typeof databaseDouble>;
	email: ReturnType<typeof emailDouble>;
	input?: typeof VALID_INPUT;
}

const run = ({ database, email, input = VALID_INPUT }: RunParams) =>
	Effect.runPromiseExit(
		submitContact(input).pipe(Effect.provide(Layer.mergeAll(database.layer, email.layer, log.layer))),
	);

beforeEach(() => {
	log.lines.length = 0;
	setSecret({ name: "GOOGLE_RECAPTCHA_SECRET_KEY", value: "secret" });
	recaptchaResponds({ success: true, score: 0.9 });
});

afterEach(() => {
	resetSecrets();
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

		expect(email.sent[0]?.email).toBe("Ada+news@Example.com");
	});

	it("still answers ok when the row cannot be written", async () => {
		const database = databaseDouble({ failInsertWith: databaseError("turso unreachable") });
		const email = emailDouble({ id: "sent-2" });

		const exit = await run({ database, email });

		expect(exit).toStrictEqual(Exit.succeed({ ok: true }));
		expect(database.inserted).toHaveLength(0);
	});

	it("logs the dropped row at error level, naming the emailId and the reason", async () => {
		const database = databaseDouble({ failInsertWith: databaseError("turso unreachable") });
		const email = emailDouble({ id: "sent-2" });

		await run({ database, email });

		expect(log.lines).toHaveLength(1);
		expect(log.lines[0]).toMatchObject({
			level: "error",
			message: "Contact was delivered but not persisted",
			context: { emailId: "sent-2" },
		});
		expect((log.lines[0]?.error as DatabaseError | undefined)?.message).toBe("turso unreachable");
	});

	it("logs nothing when the row is written", async () => {
		const database = databaseDouble();
		const email = emailDouble({ id: "sent-2" });

		await run({ database, email });

		expect(log.lines).toEqual([]);
	});

	it("fails without sending when the address wrote inside the cooldown", async () => {
		const database = databaseDouble({ contactWithinCooldown: contactRow({ email: "ada@example.com" }) });
		const email = emailDouble();

		const exit = await run({ database, email });

		expect(failureOf(exit)?._tag).toBe("DuplicateContactError");
		expect(email.sent).toHaveLength(0);
	});

	it("fails without sending when the address has already sent this exact message", async () => {
		const database = databaseDouble({ contactWithSameMessage: contactRow({ email: "ada@example.com" }) });
		const email = emailDouble();

		const exit = await run({ database, email });

		expect(failureOf(exit)?._tag).toBe("DuplicateContactError");
		expect(email.sent).toHaveLength(0);
	});

	it("fails without persisting when the mail cannot be sent", async () => {
		const database = databaseDouble();
		const email = emailDouble({ failWith: emailError("resend down") });

		const exit = await run({ database, email });

		expect(failureOf(exit)?._tag).toBe("EmailError");
		expect(database.inserted).toHaveLength(0);
	});

	it("rejects a malformed payload before spending a reCAPTCHA call", async () => {
		const recaptcha = recaptchaDouble({ score: 0.9 });
		const database = databaseDouble();
		const email = emailDouble();

		const exit = await run({ database, email, input: { ...VALID_INPUT, email: "not-an-email" } });

		expect(failureOf(exit)?._tag).toBe("ValidationError");
		expect(recaptcha.calls).toEqual([]);
	});

	it("rejects a reCAPTCHA score below the threshold", async () => {
		recaptchaResponds({ success: true, score: 0.4 });

		const database = databaseDouble();
		const email = emailDouble();

		const exit = await run({ database, email });

		expect(failureOf(exit)?._tag).toBe("ValidationError");
		expect(email.sent).toHaveLength(0);
	});

	it("fails with a RecaptchaError, not a ValidationError, when our secret is the one rejected", async () => {
		recaptchaResponds({ success: false, errorCodes: ["invalid-input-secret"] });

		const database = databaseDouble();
		const email = emailDouble();

		const exit = await run({ database, email });

		expect(failureOf(exit)?._tag).toBe("RecaptchaError");
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
