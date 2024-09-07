// @ts-ignore
import { ActionError, defineAction } from "astro:actions";
import { contactFormSchema } from "@application/entities/contact/schema";
import { Exception } from "@domain/errors";
import { app } from "@infrastructure/database/server";
import { checkDuplicatedEntries } from "@infrastructure/utils/checkDuplicatedEntries";
import { saveContact } from "@infrastructure/utils/saveContact";
import { sendEmail } from "@infrastructure/utils/sendEmail";
import { validateContact } from "@infrastructure/utils/validateContact";
import type { ContactFormData } from "@shared/ui/types";
import { getFirestore } from "firebase-admin/firestore";

type ActionHandlerParams = Omit<ContactFormData, "recaptcha">;
const database = getFirestore(app);

export const server = {
	contact: defineAction({
		accept: "form",
		input: contactFormSchema,
		handler: async ({ name, email, message }: ActionHandlerParams) => {
			try {
				const data = validateContact({
					name,
					email,
					message,
				});

				const databaseRef = database.collection("contacts");
				await checkDuplicatedEntries({ databaseRef, data });

				const { id: mailId } = await sendEmail(data);

				await saveContact({
					contactData: { id: mailId, ...data },
					databaseRef,
				});

				return { ok: !!mailId };
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
