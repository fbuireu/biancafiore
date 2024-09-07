import { contactFormSchema } from "@application/entities/contact/schema";
import { Exception } from "@domain/errors";
import type { ContactFormData } from "@shared/ui/types";

type ValidateContact = Omit<ContactFormData, "recaptcha">;

export function validateContact(contact: ValidateContact) {
	const result = contactFormSchema.safeParse(contact);

	if (!result.success) {
		throw new Exception({
			message: result.error?.errors.join(", ") || "Invalid data",
			code: "BAD_REQUEST",
		});
	}

	return result.data;
}
