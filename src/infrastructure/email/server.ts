import { CONTACT_DETAILS } from "@const/const";
import { Context, Effect, Layer } from "effect";
import { Resend } from "resend";
import { EmailError } from "../errors";

const CONTACT_FORM_CATEGORY = "web_contact_form";
const CMS_CATEGORY = "cms";
const UNKNOWN_FAILURE_MESSAGE = "Something went wrong while sending the email";

export interface ContactNotification {
	name: string;
	email: string;
	html: string;
	text: string;
}

interface CmsEmail {
	to: string;
	cc?: string[];
	replyTo?: string;
	subject: string;
	html?: string;
	text: string;
}

type EmailPayload = Parameters<Resend["emails"]["send"]>[0];

export class EmailClient extends Context.Service<
	EmailClient,
	{
		sendContactNotification(notification: ContactNotification): Effect.Effect<{ id: string }, EmailError>;
		sendCmsEmail(email: CmsEmail): Effect.Effect<{ id: string }, EmailError>;
	}
>()("EmailClient") {
	static readonly layer = Layer.effect(
		EmailClient,
		Effect.gen(function* () {
			const { getSecret } = yield* Effect.promise(() => import("astro:env/server"));
			const apiKey = getSecret("RESEND_API_KEY");

			if (!apiKey) {
				return yield* Effect.die(new Error("RESEND_API_KEY must be defined"));
			}

			const emails = new Resend(apiKey).emails;

			const sender = `${CONTACT_DETAILS.NAME} Web <${atob(CONTACT_DETAILS.ENCODED_EMAIL_FROM)}>`;

			const send = Effect.fnUntraced(function* (payload: EmailPayload) {
				const { data, error } = yield* Effect.tryPromise({
					try: () => emails.send(payload),
					catch: (cause) =>
						new EmailError({
							message: cause instanceof Error ? cause.message : String(cause),
							cause,
						}),
				});

				if (error || !data) {
					return yield* new EmailError({ message: error?.message ?? UNKNOWN_FAILURE_MESSAGE, cause: error });
				}

				return { id: data.id };
			});

			return EmailClient.of({
				sendContactNotification: Effect.fn("EmailClient.sendContactNotification")(function* ({
					name,
					email,
					html,
					text,
				}: ContactNotification) {
					return yield* send({
						from: sender,
						to: atob(CONTACT_DETAILS.ENCODED_EMAIL_BIANCA),
						replyTo: email,
						subject: `${CONTACT_DETAILS.EMAIL_SUBJECT} from ${name} (${email})`,
						tags: [{ name: "category", value: CONTACT_FORM_CATEGORY }],
						html,
						text,
					});
				}),
				sendCmsEmail: Effect.fn("EmailClient.sendCmsEmail")(function* ({
					to,
					cc,
					replyTo,
					subject,
					html,
					text,
				}: CmsEmail) {
					return yield* send({
						from: sender,
						to,
						...(cc && { cc }),
						...(replyTo && { replyTo }),
						subject,
						tags: [{ name: "category", value: CMS_CATEGORY }],
						...(html && { html }),
						text,
					});
				}),
			});
		}),
	);
}
