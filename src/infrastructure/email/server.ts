import { getSecret } from "astro:env/server";
import { CONTACT_DETAILS } from "@const/index.ts";
import type { FormData } from "@modules/contact/components/contactForm/ContactForm.tsx";
import { Resend } from "resend";

type ContactDetails = Omit<FormData, "recaptcha">;

const { emails } = new Resend(getSecret("RESEND_API_KEY"));

export async function sendEmail({ name, message, email }: ContactDetails) {
	const { data, error } = await emails.send({
		from: `${name} <${atob(CONTACT_DETAILS.ENCODED_EMAIL_FROM)}>`,
		to: atob(CONTACT_DETAILS.ENCODED_BIANCA_EMAIL),
		subject: `${CONTACT_DETAILS.EMAIL_SUBJECT} from ${name} (${email})`,
		html: `Hello sweetheart! <br /><br/>
           <p>${name} with email: ${email} has sent you the following message through the contact form of the web. <br/><br/>
           ${message}<br/><br/>
            Reply directly by clicking: <a href="mailto:${email}?subject=Re: ${encodeURIComponent(
							CONTACT_DETAILS.EMAIL_SUBJECT,
						)} from biancafiore.me">Reply</a>`,
	});

	return { data, error };
}
