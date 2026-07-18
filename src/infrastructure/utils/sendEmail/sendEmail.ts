import { CONTACT_DETAILS } from "@const/index";
import type { Except } from "@const/types";
import { EmailClient } from "@infrastructure/email/server";
import type { EmailError } from "@infrastructure/errors";
import { createEmail } from "@infrastructure/utils/createEmail";
import type { ContactFormData } from "@shared/ui/types";
import { Effect } from "effect";

type SendEmailParams = Except<ContactFormData, "recaptcha" | "emailId">;

export const sendEmail = (params: SendEmailParams): Effect.Effect<{ id: string }, EmailError, EmailClient> =>
	Effect.gen(function* () {
		const emails = yield* EmailClient;
		const { html, text } = yield* Effect.promise(() => createEmail({ ...params }));

		return yield* emails.send({
			from: `Bianca Fiore Web <${atob(CONTACT_DETAILS.ENCODED_EMAIL_FROM)}>`,
			to: atob(CONTACT_DETAILS.ENCODED_EMAIL_BIANCA),
			replyTo: params.email,
			subject: `${CONTACT_DETAILS.EMAIL_SUBJECT} from ${params.name} (${params.email})`,
			tags: [
				{
					name: "category",
					value: "web_contact_form",
				},
			],
			html,
			text,
		});
	});
