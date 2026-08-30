import { CONTACT_DETAILS } from "@const/const";
import { EmailClient, EmailClientLive } from "@infrastructure/email/server";
import { EmailError } from "@infrastructure/errors";
import { resetSecrets, setSecret } from "@tests/doubles/astroEnvServer";
import { Cause, Effect, Exit, Option } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
	Resend: class {
		emails = { send };
	},
}));

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

const sendContact = async () => {
	setSecret({ name: API_KEY_SECRET, value: "re_test_key" });

	const exit = await build();
	if (!Exit.isSuccess(exit)) throw new Error("the layer refused to build");

	return Effect.runPromiseExit(
		exit.value.sendContactNotification({
			name: "A Reader",
			email: "reader@example.com",
			html: "<p>Hello</p>",
			text: "Hello",
		}),
	);
};

const failureOf = (exit: Exit.Exit<unknown, unknown>): unknown =>
	Exit.isFailure(exit) ? Option.getOrUndefined(Cause.failureOption(exit.cause)) : undefined;

describe("EmailClient.sendContactNotification", () => {
	beforeEach(() => {
		send.mockReset();
	});

	it("answers the vendor's id once the send is accepted", async () => {
		send.mockResolvedValue({ data: { id: "email-1" }, error: null });

		const exit = await sendContact();

		expect(Exit.isSuccess(exit) && exit.value).toStrictEqual({ id: "email-1" });
	});

	it("addresses Bianca, replies to the visitor, and never puts either address in the subject", async () => {
		send.mockResolvedValue({ data: { id: "email-1" }, error: null });

		await sendContact();

		const [payload] = send.mock.calls[0] as [Record<string, unknown>];

		expect(payload.to).toBe(atob(CONTACT_DETAILS.ENCODED_EMAIL_BIANCA));
		expect(payload.from).toContain(atob(CONTACT_DETAILS.ENCODED_EMAIL_FROM));
		expect(payload.replyTo).toBe("reader@example.com");
		expect(payload.html).toBe("<p>Hello</p>");
		expect(payload.text).toBe("Hello");
	});

	it("tags the send so the contact form is separable in the vendor's own reporting", async () => {
		send.mockResolvedValue({ data: { id: "email-1" }, error: null });

		await sendContact();

		const [payload] = send.mock.calls[0] as [{ tags: { name: string; value: string }[] }];

		expect(payload.tags).toStrictEqual([{ name: "category", value: "web_contact_form" }]);
	});

	it("fails with the vendor's message when the send is refused", async () => {
		send.mockResolvedValue({ data: null, error: { message: "You can only send testing emails" } });

		const failure = failureOf(await sendContact());

		expect(failure).toBeInstanceOf(EmailError);
		expect((failure as EmailError).message).toBe("You can only send testing emails");
	});

	it("says something went wrong when the vendor refuses without saying why", async () => {
		send.mockResolvedValue({ data: null, error: null });

		expect((failureOf(await sendContact()) as EmailError).message).toBe("Something went wrong while sending the email");
	});

	it("turns a rejected send into an EmailError rather than a defect", async () => {
		send.mockRejectedValue(new Error("network down"));

		const exit = await sendContact();

		expect(Exit.isFailure(exit) && Cause.isDie(exit.cause)).toBe(false);
		expect((failureOf(exit) as EmailError).message).toBe("network down");
	});

	it("describes a rejection that is not an Error rather than dropping it", async () => {
		send.mockRejectedValue("gateway timeout");

		const failure = failureOf(await sendContact()) as EmailError;

		expect(failure.message).toBe("gateway timeout");
		expect(failure.cause).toBe("gateway timeout");
	});
});
