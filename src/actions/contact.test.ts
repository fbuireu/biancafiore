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
import { type RecaptchaDouble, type RecaptchaDoubleParams, recaptchaDouble } from "@tests/doubles/network";
import { failureOf } from "@tests/helpers/exit";
import { Cause, Effect, Exit, Layer } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { answerContact, type ContactError, submitContact } from "./contact";
import { type ContactErrorResponse, contactErrorResponse } from "./errorResponse";

const VALID_INPUT = {
	name: "Ada",
	email: "Ada+news@Example.com ",
	message: "Hello there",
	recaptcha: "token",
};

const recaptchaResponds = (verdict: RecaptchaDoubleParams): RecaptchaDouble => recaptchaDouble(verdict);

const log = loggerDouble();

interface RunParams {
	database: ReturnType<typeof databaseDouble>;
	email: ReturnType<typeof emailDouble>;
	input?: typeof VALID_INPUT;
}

const run = ({ database, email, input = VALID_INPUT }: RunParams): Promise<Exit.Exit<{ ok: boolean }, ContactError>> =>
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
	vi.restoreAllMocks();
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

describe("answerContact", () => {
	const TURSO_SECRETS = ["ASTRO_DB_REMOTE_URL", "ASTRO_DB_APP_TOKEN"];
	const RESEND_SECRET = "RESEND_API_KEY";
	const CONFIGURED_VALUES: Record<string, string> = {
		ASTRO_DB_REMOTE_URL: "libsql://contacts.example.turso.io",
		ASTRO_DB_APP_TOKEN: "turso-token",
		RESEND_API_KEY: "re_resend_key",
	};

	const configure = (names: string[]): void => {
		for (const name of names) setSecret({ name, value: CONFIGURED_VALUES[name] ?? "" });
	};

	const answerToAnyOtherFailure = (): Promise<ContactErrorResponse> =>
		Effect.runPromise(contactErrorResponse(Cause.fail(emailError("resend down"))).pipe(Effect.provide(log.layer)));

	it.each([
		{ missing: "the Turso secrets", configured: [RESEND_SECRET], named: TURSO_SECRETS[0] },
		{ missing: "the Resend key", configured: TURSO_SECRETS, named: RESEND_SECRET },
	])(
		"answers a Worker missing $missing with the generic server error every other failure gets, because the layer's message names our configuration",
		async ({ configured, named }) => {
			vi.spyOn(console, "error").mockImplementation(() => undefined);
			configure(configured);

			const answer = await answerContact(VALID_INPUT);

			expect(answer).toStrictEqual({ success: false, error: await answerToAnyOtherFailure() });
			expect(JSON.stringify(answer)).not.toContain(named);
		},
	);

	it("logs the layer that could not be built, so the Worker log still names the missing secret", async () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
		configure([RESEND_SECRET]);

		await answerContact(VALID_INPUT);

		expect(consoleError).toHaveBeenCalledTimes(1);
		expect(String(consoleError.mock.calls[0]?.[0])).toContain(TURSO_SECRETS[0]);
	});

	it("still answers a refusal the program raises with its own status and copy, through the layers it builds", async () => {
		configure([...TURSO_SECRETS, RESEND_SECRET]);

		const answer = await answerContact({ ...VALID_INPUT, email: "not-an-email" });

		expect(answer).toStrictEqual({
			success: false,
			error: { code: "BAD_REQUEST", message: "Still not a valid email fella" },
		});
	});
});
