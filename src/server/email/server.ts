import { Resend } from "resend";
import { CONTACT_DETAILS } from "../../consts.ts";
import type { FormData } from "@components/organisms/contactForm";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

type ContactDetails = Omit<FormData, "recaptcha">;

export const sendEmail = async ({ name, message, email }: ContactDetails) => {
	const { data, error } = await resend.emails.send({
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
};
