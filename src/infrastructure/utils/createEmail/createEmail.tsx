import { CONTACT_DETAILS, DEFAULT_LOCALE_STRING } from "@const/index";
import type { Except } from "@const/types";
import { render } from "@react-email/render";
import type { ContactFormData } from "@shared/ui/types";
import { ContactNotificationEmail } from "./ContactNotificationEmail";

type GenerateHtmlParams = Except<ContactFormData, "recaptcha" | "emailId">;

const URL_ENCODED_SPACE_REGEX = /%20/g;

export interface ContactEmailContent {
	html: string;
	text: string;
}

export async function createEmail({ name, email, message }: GenerateHtmlParams): Promise<ContactEmailContent> {
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
