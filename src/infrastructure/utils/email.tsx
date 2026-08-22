import { CONTACT_DETAILS, DEFAULT_LOCALE_STRING } from "@const/index";
import type { Except } from "@const/types";
import { ContactNotificationEmail } from "@infrastructure/email/ContactNotificationEmail";
import { EmailClient } from "@infrastructure/email/server";
import type { EmailError } from "@infrastructure/errors";
import { render } from "@react-email/render";
import type { ContactFormData } from "@shared/ui/types";
import { Effect } from "effect";

type SendEmailParams = Except<ContactFormData, "recaptcha" | "emailId">;

interface ContactEmailContent {
	html: string;
	text: string;
}

export async function createEmail({ name, email, message }: SendEmailParams): Promise<ContactEmailContent> {
	const date = new Date().toLocaleString(DEFAULT_LOCALE_STRING);
	const subject = encodeURIComponent(`Re: ${CONTACT_DETAILS.EMAIL_SUBJECT} from biancafiore.me`);
	const mailTo = `mailto:${email}?subject=${subject}`;

	const element = <ContactNotificationEmail name={name} email={email} message={message} date={date} mailTo={mailTo} />;

	const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);

	return { html, text };
}

export const sendEmail = (params: SendEmailParams): Effect.Effect<{ id: string }, EmailError, EmailClient> =>
	Effect.gen(function* () {
		const emails = yield* EmailClient;
		const { html, text } = yield* Effect.promise(() => createEmail(params));

		return yield* emails.sendContactNotification({ name: params.name, email: params.email, html, text });
	});
