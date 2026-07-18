import { CONTACT_DETAILS, DEFAULT_LOCALE_STRING } from "@const/index";
import type { Except } from "@const/types";
import { ContactNotificationEmail } from "@infrastructure/email/ContactNotificationEmail";
import { EmailClient } from "@infrastructure/email/server";
import type { EmailError } from "@infrastructure/errors";
import { render } from "@react-email/render";
import type { ContactFormData } from "@shared/ui/types";
import { Effect } from "effect";

const URL_ENCODED_SPACE_REGEX = /%20/g;
const ALIAS_REGEX = /\+.*?(?=@)/;

type ContactEmailParams = Except<ContactFormData, "recaptcha" | "emailId">;

export interface ContactEmailContent {
	html: string;
	text: string;
}

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase().replace(ALIAS_REGEX, "");
}

export async function createEmail({ name, email, message }: ContactEmailParams): Promise<ContactEmailContent> {
	const date = new Date().toLocaleString(DEFAULT_LOCALE_STRING);
	const mailTo =
		`mailto:${email}?subject=Re: ${encodeURIComponent(CONTACT_DETAILS.EMAIL_SUBJECT)} from biancafiore.me`.replace(
			URL_ENCODED_SPACE_REGEX,
			" ",
		);

	const element = <ContactNotificationEmail name={name} email={email} message={message} date={date} mailTo={mailTo} />;

	const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);

	return { html, text };
}

export const sendEmail = (params: ContactEmailParams): Effect.Effect<{ id: string }, EmailError, EmailClient> =>
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
