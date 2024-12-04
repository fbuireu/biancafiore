import { contactFormSchema } from "@application/entities/contact/schema";
import type { Except } from "@const/types.ts";
import { Exception } from "@domain/errors";
import type { ContactFormData } from "@shared/ui/types";

type ValidateContact = Except<ContactFormData, "recaptcha">;

export function validateContact(contact: ValidateContact) {
	const { success, data, error } = contactFormSchema.safeParse(contact);

	if (!success) {
		throw new Exception({
			message: error?.errors.join(", ") || "Invalid data",
			code: "BAD_REQUEST",
		});
	}

	return data;
}
