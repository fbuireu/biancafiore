// @ts-ignore
import { ActionError, defineAction, z } from "astro:actions";
import { DEFAULT_LOCALE_STRING } from "@const/index.ts";
import { app } from "@infrastructure/database/server.ts";
import { sendEmail } from "@infrastructure/email/server.ts";
import type { FormData } from "@ui/modules/contact/components/contactForm";
import { getFirestore } from "firebase-admin/firestore";

type ContactDetails = Omit<FormData, "recaptcha">;

const contactFormSchema = z.object({
	name: z.string(),
	email: z.string().email(),
});

const database = getFirestore(app);

export const server = {
	contact: defineAction({
		accept: "form",
		input: contactFormSchema,
		handler: async ({ name, email, message }: ContactDetails) => {
			try {
				const contactValidation = contactFormSchema.safeParse({
					name,
					email,
					message,
				});
				if (!contactValidation.success) throw new Error(contactValidation.error?.errors.join(", ") || "Invalid data");

				const { data } = contactValidation;
				const databaseRef = database.collection("contacts");
				await databaseRef.add({
					id: crypto.randomUUID(),
					name: data.name,
					email: data.email,
					message: data.message,
					date: new Date().toLocaleString(DEFAULT_LOCALE_STRING),
				});
				const { data: emailData, error: emailError } = await sendEmail(data);
				const success = emailData && !emailError;
				if (!success && emailError) {
					throw new Error(`Something went wrong sending the email. Error: ${emailError.message} (${emailError.name})`);
				}

				return {
					ok: success,
				};
			} catch (error: unknown) {
				const actionError = error as ActionError;

				const message = actionError.message || "Something went wrong";
				const code = actionError.status ?? 500;

				return new ActionError({ code, message });
			}
		},
	}),
};
