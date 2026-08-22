import { EmailClient, EmailClientLive } from "@infrastructure/email/server";
import { resetSecrets, setSecret } from "@tests/doubles/astroEnvServer";
import { Effect, Exit } from "effect";
import { afterEach, describe, expect, it } from "vitest";

const API_KEY_SECRET = "RESEND_API_KEY";

const build = () => Effect.runPromiseExit(EmailClient.pipe(Effect.provide(EmailClientLive)));

afterEach(() => {
	resetSecrets();
});

describe("EmailClientLive", () => {
	it("builds a client when the api key is configured", async () => {
		setSecret(API_KEY_SECRET, "re_test_key");

		const exit = await build();

		expect(Exit.isSuccess(exit)).toBe(true);
	});

	it("hands out the one notification the site sends rather than the vendor's send", async () => {
		setSecret(API_KEY_SECRET, "re_test_key");

		const exit = await build();

		expect(Exit.isSuccess(exit) && Object.keys(exit.value).toSorted()).toStrictEqual(["sendContactNotification"]);
	});
});
