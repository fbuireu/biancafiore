import { CONTACT_DETAILS, DEFAULT_LOCALE_STRING } from "@const/index";
import type { ValidatedContact } from "@domain/contact/types";
import { Effect } from "effect";
import { render } from "react-email";
import { ContactNotificationEmail } from "../email/ContactNotificationEmail";
import { EmailClient, type SentEmail } from "../email/server";
import type { EmailError } from "../errors";

interface ContactEmailContent {
	html: string;
	text: string;
}

export async function createEmail({ name, email, message }: ValidatedContact): Promise<ContactEmailContent> {
	const date = new Date().toLocaleString(DEFAULT_LOCALE_STRING, { timeZone: "UTC", timeZoneName: "short" });
	const subject = encodeURIComponent(`Re: ${CONTACT_DETAILS.EMAIL_SUBJECT} from biancafiore.me`);
	const mailTo = `mailto:${email}?subject=${subject}`;

	const element = <ContactNotificationEmail name={name} email={email} message={message} date={date} mailTo={mailTo} />;

	const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);

	return { html, text };
}

export const sendEmail = Effect.fn("sendEmail")(function* (
	params: ValidatedContact,
): Effect.fn.Return<SentEmail, EmailError, EmailClient> {
	const emails = yield* EmailClient;
	const { html, text } = yield* Effect.promise(() => createEmail(params));

	return yield* emails.sendContactNotification({ name: params.name, email: params.email, html, text });
});
