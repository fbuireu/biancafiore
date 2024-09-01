import type { CreateEmailResponse } from "resend";
import type { ContactFormData } from "@shared/ui/types";
import { emails } from "@infrastructure/email/server";
import { CONTACT_DETAILS } from "@const/index";

type SendEmailParams = Omit<ContactFormData, "recaptcha">;

export async function sendEmail({
    name,
    message,
    email,
}: SendEmailParams): Promise<CreateEmailResponse> {
    const { data, error } = await emails.send({
        from: `${name} <${atob(CONTACT_DETAILS.ENCODED_EMAIL_FROM)}>`,
        to: atob(CONTACT_DETAILS.ENCODED_EMAIL_BIANCA),
        subject: `${CONTACT_DETAILS.EMAIL_SUBJECT} from ${name} (${email})`,
        html: `Hello sweetheart! <br /><br/>
           <p>${name} with email: ${email} has sent you the following message through the contact form of the web. <br/><br/>
           ${message}<br/><br/>
            Reply directly by clicking: <a href="mailto:${email}?subject=Re: ${encodeURIComponent(
            CONTACT_DETAILS.EMAIL_SUBJECT
        )} from biancafiore.me">Reply
           </a>
`,
    });

    return { data, error };
}
