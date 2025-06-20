// @ts-ignore
import { ActionError, defineAction } from "astro:actions";
import { contactFormSchema } from "@application/entities/contact/schema";
import type { Except } from "@const/types";
import { Exception } from "@domain/errors";
import { checkDuplicatedEntries } from "@infrastructure/utils/checkDuplicatedEntries";
import { saveContact } from "@infrastructure/utils/saveContact";
import { sendEmail } from "@infrastructure/utils/sendEmail";
import { validateContact } from "@infrastructure/utils/validateContact";
import type { ContactFormData } from "@shared/ui/types";

type ActionHandlerParams = Except<ContactFormData, "recaptcha" | "emailId">;

export const server = {
	contact: defineAction({
		accept: "form",
		input: contactFormSchema,
		handler: async (params: ActionHandlerParams) => {
			try {
				const data = validateContact(params);
				await checkDuplicatedEntries(data);
				const { id: emailId } = await sendEmail(data);
				await saveContact({ emailId, ...data });

				return { ok: !!emailId };
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
		},
	}),
};
