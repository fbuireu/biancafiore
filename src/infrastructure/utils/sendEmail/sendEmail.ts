import { ActionError } from "astro:actions";
import { CONTACT_DETAILS } from "@const/index";
import type { Except } from "@const/types";
import { Exception } from "@domain/errors";
import { emails } from "@infrastructure/email/server";
import { createEmail } from "@infrastructure/utils/createEmail";
import type { ContactFormData } from "@shared/ui/types";
import type { CreateEmailResponseSuccess } from "resend";

type SendEmailParams = Except<ContactFormData, "recaptcha" | "emailId">;

export async function sendEmail(params: SendEmailParams): Promise<CreateEmailResponseSuccess> {
	try {
		const email = createEmail({ ...params });

		const { data, error } = await emails.send({
			from: `${params.name} <${atob(CONTACT_DETAILS.ENCODED_EMAIL_FROM)}>`,
			to: atob(CONTACT_DETAILS.ENCODED_EMAIL_BIANCA),
			subject: `${CONTACT_DETAILS.EMAIL_SUBJECT} from ${params.name} (${params.email})`,
			tags: [
				{
					name: "category",
					value: "web_contact_form",
				},
			],
			html: email,
		});

		if (error || !data) {
			throw new Exception({
				message: "Something went wrong while sending the email",
			});
		}

		return { id: data.id };
	} catch (error: unknown) {
		if (error instanceof Exception) {
			throw new ActionError({
				code: error.code,
				message: error.message,
			});
		}

		throw new ActionError({
			code: "INTERNAL_SERVER_ERROR",
			message:
				"Whoopsie! Something went wrong. It's my fault (or actually my boyfriend's). Please try again in a few minutes after refreshing the page.",
		});
	}
}
