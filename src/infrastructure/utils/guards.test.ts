import { resetSecrets, setSecret } from "@tests/doubles/astroEnvServer";
import { recaptchaDouble, SITEVERIFY_URL } from "@tests/doubles/network";
import { failureOf } from "@tests/helpers/exit";
import { Effect, Exit } from "effect";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { validateContact, verifyRecaptcha } from "./guards";

const RECAPTCHA_ERROR_MESSAGE = "Mr. Robot, is that you? Please refresh the page and try again.";

const messageOf = <E extends { message: string }>(exit: Exit.Exit<unknown, E>): string | undefined =>
	failureOf(exit)?.message;

const tagOf = <E extends { _tag: string }>(exit: Exit.Exit<unknown, E>): string | undefined => failureOf(exit)?._tag;

beforeEach(() => {
	setSecret({ name: "GOOGLE_RECAPTCHA_SECRET_KEY", value: "server-secret" });
});

afterEach(() => {
	resetSecrets();
});

describe("validateContact", () => {
	it("keeps the address exactly as typed and only strips the surrounding whitespace", async () => {
		const exit = await Effect.runPromiseExit(
			validateContact({ name: "  Ada  ", email: "  Ada+news@Example.com  ", message: "  Hello there  " }),
		);

		expect(exit).toStrictEqual(Exit.succeed({ name: "Ada", email: "Ada+news@Example.com", message: "Hello there" }));
	});

	it("rejects a name made only of whitespace, because trimming happens before the length check", async () => {
		const exit = await Effect.runPromiseExit(
			validateContact({ name: "   ", email: "ada@example.com", message: "Hello there" }),
		);

		expect(messageOf(exit)).toBe("Please insert your name");
	});

	it("joins every schema issue into one comma separated message, in field order", async () => {
		const exit = await Effect.runPromiseExit(validateContact({ name: "", email: "not-an-email", message: "" }));

		expect(messageOf(exit)).toBe(
			"Please insert your name, Still not a valid email fella, Please insert a valid message",
		);
	});

	it("does not ask for a reCAPTCHA token and drops one that is handed to it anyway", async () => {
		const payload = { name: "Ada", email: "ada@example.com", message: "Hello there", recaptcha: "token" };

		const exit = await Effect.runPromiseExit(validateContact(payload));

		expect(exit).toStrictEqual(Exit.succeed({ name: "Ada", email: "ada@example.com", message: "Hello there" }));
	});
});

describe("verifyRecaptcha", () => {
	it("posts the configured secret and the token as a form encoded body to Google", async () => {
		const recaptcha = recaptchaDouble({ score: 0.9 });

		await Effect.runPromiseExit(verifyRecaptcha("visitor-token"));

		expect(recaptcha.calls).toStrictEqual([
			{
				url: SITEVERIFY_URL,
				contentType: "application/x-www-form-urlencoded",
				secret: "server-secret",
				response: "visitor-token",
			},
		]);
	});

	it("sends an empty secret rather than failing when the key is not configured", async () => {
		resetSecrets();
		const recaptcha = recaptchaDouble({ score: 0.9 });

		const exit = await Effect.runPromiseExit(verifyRecaptcha("visitor-token"));

		expect(recaptcha.calls[0]?.secret).toBe("");
		expect(Exit.isSuccess(exit)).toBe(true);
	});

	it("rejects a score one hundredth below the threshold", async () => {
		recaptchaDouble({ score: 0.49 });

		const exit = await Effect.runPromiseExit(verifyRecaptcha("visitor-token"));

		expect(tagOf(exit)).toBe("ValidationError");
		expect(messageOf(exit)).toBe(RECAPTCHA_ERROR_MESSAGE);
	});

	it("accepts a score sitting exactly on the threshold", async () => {
		recaptchaDouble({ score: 0.5 });

		const exit = await Effect.runPromiseExit(verifyRecaptcha("visitor-token"));

		expect(exit).toStrictEqual(Exit.succeed(undefined));
	});

	it("accepts a score above the threshold", async () => {
		recaptchaDouble({ score: 0.51 });

		const exit = await Effect.runPromiseExit(verifyRecaptcha("visitor-token"));

		expect(Exit.isSuccess(exit)).toBe(true);
	});

	it("rejects a successful verification that carries no score at all", async () => {
		recaptchaDouble({});

		const exit = await Effect.runPromiseExit(verifyRecaptcha("visitor-token"));

		expect(messageOf(exit)).toBe(RECAPTCHA_ERROR_MESSAGE);
	});

	it("rejects an unsuccessful verification even when the score would pass", async () => {
		recaptchaDouble({ success: false, score: 1 });

		const exit = await Effect.runPromiseExit(verifyRecaptcha("visitor-token"));

		expect(tagOf(exit)).toBe("ValidationError");
		expect(messageOf(exit)).toBe(RECAPTCHA_ERROR_MESSAGE);
	});

	it("keeps an expired or replayed token the visitor's problem, not ours", async () => {
		recaptchaDouble({ success: false, errorCodes: ["timeout-or-duplicate"] });

		const exit = await Effect.runPromiseExit(verifyRecaptcha("visitor-token"));

		expect(tagOf(exit)).toBe("ValidationError");
		expect(messageOf(exit)).toBe(RECAPTCHA_ERROR_MESSAGE);
	});

	it("blames our key rather than the visitor when Google refuses the secret", async () => {
		recaptchaDouble({ success: false, errorCodes: ["invalid-input-secret"] });

		const exit = await Effect.runPromiseExit(verifyRecaptcha("visitor-token"));

		expect(tagOf(exit)).toBe("RecaptchaError");
		expect(messageOf(exit)).not.toBe(RECAPTCHA_ERROR_MESSAGE);
	});

	it("blames our key when the secret is absent altogether", async () => {
		recaptchaDouble({ success: false, errorCodes: ["missing-input-secret"] });

		const exit = await Effect.runPromiseExit(verifyRecaptcha("visitor-token"));

		expect(tagOf(exit)).toBe("RecaptchaError");
	});

	it("says it never got a verdict when the request itself never lands", async () => {
		recaptchaDouble({ unreachable: true });

		const exit = await Effect.runPromiseExit(verifyRecaptcha("visitor-token"));

		expect(tagOf(exit)).toBe("RecaptchaError");
		expect(messageOf(exit)).not.toBe(RECAPTCHA_ERROR_MESSAGE);
	});

	it("treats an unreadable response body as no verdict, not as a defect and not as a bot", async () => {
		recaptchaDouble({ malformed: true });

		const exit = await Effect.runPromiseExit(verifyRecaptcha("visitor-token"));

		expect(Exit.isFailure(exit)).toBe(true);
		expect(tagOf(exit)).toBe("RecaptchaError");
	});

	it.each([
		["an empty object", {}],
		["null", null],
		["a verdict whose success is not a boolean", { success: "true", score: 0.9 }],
		["a passing verdict whose score is a string", { success: true, score: "0.9" }],
		["a refusal whose error codes are not a list", { success: false, "error-codes": "invalid-input-secret" }],
	])(
		"treats readable JSON that is not a siteverify answer, such as %s, as no verdict rather than a bot",
		async (_label, answer) => {
			recaptchaDouble({ answer });

			const exit = await Effect.runPromiseExit(verifyRecaptcha("visitor-token"));

			expect(tagOf(exit)).toBe("RecaptchaError");
			expect(messageOf(exit)).not.toBe(RECAPTCHA_ERROR_MESSAGE);
		},
	);

	it("accepts a siteverify answer carrying fields the guard does not read", async () => {
		recaptchaDouble({ answer: { success: true, score: 0.9, action: "contact", hostname: "biancafiore.me" } });

		const exit = await Effect.runPromiseExit(verifyRecaptcha("visitor-token"));

		expect(Exit.isSuccess(exit)).toBe(true);
	});
});
