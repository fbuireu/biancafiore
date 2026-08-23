import { EmailClient, EmailClientLive } from "@infrastructure/email/server";
import { resetSecrets, setSecret } from "@tests/doubles/astroEnvServer";
import { Cause, Effect, Exit, Option } from "effect";
import { afterEach, describe, expect, it } from "vitest";

const API_KEY_SECRET = "RESEND_API_KEY";

const build = () => Effect.runPromiseExit(EmailClient.pipe(Effect.provide(EmailClientLive)));

afterEach(() => {
	resetSecrets();
});

const defectOf = (exit: Exit.Exit<unknown, unknown>): unknown =>
	Exit.isFailure(exit) ? Option.getOrUndefined(Cause.dieOption(exit.cause)) : undefined;

describe("EmailClientLive", () => {
	it("dies rather than handing the vendor an undefined key, which it answers with its own error", async () => {
		const exit = await build();

		expect(Exit.isFailure(exit) && Cause.isDie(exit.cause)).toBe(true);
		expect((defectOf(exit) as Error).message).toBe("RESEND_API_KEY must be defined");
	});

	it("builds a client when the api key is configured", async () => {
		setSecret({ name: API_KEY_SECRET, value: "re_test_key" });

		const exit = await build();

		expect(Exit.isSuccess(exit)).toBe(true);
	});

	it("hands out the one notification the site sends rather than the vendor's send", async () => {
		setSecret({ name: API_KEY_SECRET, value: "re_test_key" });

		const exit = await build();

		expect(Exit.isSuccess(exit) && Object.keys(exit.value).toSorted()).toStrictEqual(["sendContactNotification"]);
	});
});
