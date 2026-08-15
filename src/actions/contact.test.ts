import type { ContactError } from "@actions/contact";
import { submitContact } from "@actions/contact";
import { LibsqlError } from "@libsql/client/web";
import { resetSecrets, setSecret } from "@tests/doubles/astroEnvServer";
import { contactRow, databaseDouble, databaseError, emailDouble, emailError } from "@tests/doubles/contactLayers";
import { type RecaptchaDoubleOptions, recaptchaDouble } from "@tests/doubles/network";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { Cause, Effect, Exit, Layer, Logger, Option } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const VALID_INPUT = {
	name: "Ada",
	email: "Ada+news@Example.com ",
	message: "Hello there",
	recaptcha: "token",
};

const recaptchaResponds = (verdict: RecaptchaDoubleOptions) => recaptchaDouble(verdict);

interface CapturedLog {
	level: string;
	message: string;
}

const logged: CapturedLog[] = [];

const capturingLogger = Logger.replace(
	Logger.defaultLogger,
	Logger.make(({ logLevel, message }) => {
		logged.push({
			level: logLevel.label,
			message: (Array.isArray(message) ? message : [message]).map(String).join(" "),
		});
	}),
);

const run = ({
	database,
	email,
	input = VALID_INPUT,
}: {
	database: ReturnType<typeof databaseDouble>;
	email: ReturnType<typeof emailDouble>;
	input?: typeof VALID_INPUT;
}) =>
	Effect.runPromiseExit(
		submitContact(input).pipe(
			Effect.provide(Layer.merge(database.layer, email.layer)),
			Effect.provide(capturingLogger),
		),
	);

const failureTag = (exit: Exit.Exit<{ ok: boolean }, ContactError>): string | undefined =>
	Exit.isFailure(exit) ? Option.getOrUndefined(Cause.failureOption(exit.cause))?._tag : undefined;

beforeEach(() => {
	logged.length = 0;
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

	it("logs the dropped row at error level, naming the emailId and the reason", async () => {
		const database = databaseDouble({ failInsertWith: databaseError("turso unreachable") });
		const email = emailDouble({ id: "sent-2" });

		await run({ database, email });

		expect(logged).toStrictEqual([
			{ level: "ERROR", message: "Contact sent-2 was delivered but not persisted: turso unreachable" },
		]);
	});

	it("logs nothing when the row is written", async () => {
		const database = databaseDouble();
		const email = emailDouble({ id: "sent-2" });

		await run({ database, email });

		expect(logged).toEqual([]);
	});

	it("answers ok to the loser of a duplicate race, whose mail has already gone out", async () => {
		const database = databaseDouble({
			failInsertWith: databaseError(
				"UNIQUE constraint failed: contact.email",
				new DrizzleQueryError(
					"insert into contact",
					[],
					new LibsqlError("UNIQUE constraint failed: contact.email", "SQLITE_CONSTRAINT_UNIQUE"),
				),
			),
		});
		const email = emailDouble({ id: "sent-3" });

		const exit = await run({ database, email });

		expect(exit).toStrictEqual(Exit.succeed({ ok: true }));
		expect(email.sent).toHaveLength(1);
		expect(database.inserted).toHaveLength(0);
	});

	it("fails without sending when the address already contacted", async () => {
		const database = databaseDouble({ existingContact: contactRow("ada@example.com") });
		const email = emailDouble();

		const exit = await run({ database, email });

		expect(failureTag(exit)).toBe("DuplicateContactError");
		expect(email.sent).toHaveLength(0);
	});

	it("fails without persisting when the mail cannot be sent", async () => {
		const database = databaseDouble();
		const email = emailDouble({ failWith: emailError("resend down") });

		const exit = await run({ database, email });

		expect(failureTag(exit)).toBe("EmailError");
		expect(database.inserted).toHaveLength(0);
	});

	it("rejects a malformed payload before spending a reCAPTCHA call", async () => {
		const recaptcha = recaptchaDouble({ score: 0.9 });
		const database = databaseDouble();
		const email = emailDouble();

		const exit = await run({ database, email, input: { ...VALID_INPUT, email: "not-an-email" } });

		expect(failureTag(exit)).toBe("ValidationError");
		expect(recaptcha.calls).toEqual([]);
	});

	it("rejects a reCAPTCHA score below the threshold", async () => {
		recaptchaResponds({ success: true, score: 0.4 });

		const database = databaseDouble();
		const email = emailDouble();

		const exit = await run({ database, email });

		expect(failureTag(exit)).toBe("ValidationError");
		expect(email.sent).toHaveLength(0);
	});

	it("fails with a RecaptchaError, not a ValidationError, when our secret is the one rejected", async () => {
		recaptchaResponds({ success: false, errorCodes: ["invalid-input-secret"] });

		const database = databaseDouble();
		const email = emailDouble();

		const exit = await run({ database, email });

		expect(failureTag(exit)).toBe("RecaptchaError");
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
