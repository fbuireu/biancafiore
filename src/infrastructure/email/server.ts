import { CONTACT_DETAILS } from "@const/const";
import { EmailError } from "@infrastructure/errors";
import { Context, Effect, Layer } from "effect";
import { Resend } from "resend";

const CONTACT_FORM_CATEGORY = "web_contact_form";
const UNKNOWN_FAILURE_MESSAGE = "Something went wrong while sending the email";

export interface ContactNotification {
	name: string;
	email: string;
	html: string;
	text: string;
}

export class EmailClient extends Context.Tag("EmailClient")<
	EmailClient,
	{
		sendContactNotification(notification: ContactNotification): Effect.Effect<{ id: string }, EmailError>;
	}
>() {}

export const EmailClientLive = Layer.effect(
	EmailClient,
	Effect.gen(function* () {
		const { getSecret } = yield* Effect.promise(() => import("astro:env/server"));
		const apiKey = getSecret("RESEND_API_KEY");

		if (!apiKey) {
			return yield* Effect.die(new Error("RESEND_API_KEY must be defined"));
		}

		const emails = new Resend(apiKey).emails;

		return {
			sendContactNotification: ({ name, email, html, text }: ContactNotification) =>
				Effect.tryPromise({
					try: () =>
						emails.send({
							from: `${CONTACT_DETAILS.NAME} Web <${atob(CONTACT_DETAILS.ENCODED_EMAIL_FROM)}>`,
							to: atob(CONTACT_DETAILS.ENCODED_EMAIL_BIANCA),
							replyTo: email,
							subject: `${CONTACT_DETAILS.EMAIL_SUBJECT} from ${name} (${email})`,
							tags: [
								{
									name: "category",
									value: CONTACT_FORM_CATEGORY,
								},
							],
							html,
							text,
						}),
					catch: (cause) =>
						new EmailError({
							message: cause instanceof Error ? cause.message : String(cause),
							cause,
						}),
				}).pipe(
					Effect.flatMap(({ data, error }) =>
						error || !data
							? Effect.fail(
									new EmailError({
										message: error?.message ?? UNKNOWN_FAILURE_MESSAGE,
										cause: error,
									}),
								)
							: Effect.succeed({ id: data.id }),
					),
				),
		};
	}),
);
