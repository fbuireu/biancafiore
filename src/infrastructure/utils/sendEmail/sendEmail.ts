import type { CreateEmailResponse } from "resend";
import type { ContactFormData } from "@shared/ui/types";
import { emails } from "@infrastructure/email/server";
import { CONTACT_DETAILS } from "@const/index";
import { createException } from "@domain/errors/utils";

type SendEmailParams = Omit<ContactFormData, "recaptcha">;

export async function sendEmail({
    name,
    message,
    email,
}: SendEmailParams): Promise<Omit<CreateEmailResponse, "error">> {
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
           </a></p>`,
    });
    if (error) {
        throw createException({
            message: `Something went wrong sending the email. Error: ${error.message} (${error.name})`,
        });
    }
    return { data };
}
