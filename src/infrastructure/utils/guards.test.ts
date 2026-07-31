import type { ValidationError } from "@infrastructure/errors";
import { validateContact, verifyRecaptcha } from "@infrastructure/utils/guards";
import { Cause, Effect, Exit, Option } from "effect";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetSecrets, setSecret } from "../../../tests/doubles/astroEnvServer";
import { recaptchaDouble } from "../../../tests/doubles/network";

const RECAPTCHA_ERROR_MESSAGE = "Mr. Robot, is that you? Please refresh the page and try again.";

const messageOf = (exit: Exit.Exit<unknown, ValidationError>): string | undefined =>
	Exit.isFailure(exit) ? Option.getOrUndefined(Cause.failureOption(exit.cause))?.message : undefined;

beforeEach(() => {
	setSecret("GOOGLE_RECAPTCHA_SECRET_KEY", "server-secret");
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

		expect(messageOf(exit)).toBe(RECAPTCHA_ERROR_MESSAGE);
	});

	it("answers with the same visitor facing message when the request itself never lands", async () => {
		recaptchaDouble({ unreachable: true });

		const exit = await Effect.runPromiseExit(verifyRecaptcha("visitor-token"));

		expect(messageOf(exit)).toBe(RECAPTCHA_ERROR_MESSAGE);
	});

	it("treats an unreadable response body as a failed verification, not a defect", async () => {
		recaptchaDouble({ malformed: true });

		const exit = await Effect.runPromiseExit(verifyRecaptcha("visitor-token"));

		expect(messageOf(exit)).toBe(RECAPTCHA_ERROR_MESSAGE);
	});
});
