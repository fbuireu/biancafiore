import { contactFormSchema } from "@application/entities/contact/schema";
import { Exception } from "@domain/errors";
import type { ContactFormData } from "@shared/ui/types";
import type { Except } from "type-fest";

type ValidateContact = Except<ContactFormData, "recaptcha" | "emailId">;

export function validateContact(contact: ValidateContact): ValidateContact {
	const { success, data, error } = contactFormSchema.safeParse(contact);

	if (!success) {
		throw new Exception({
			message: error?.errors.join(", ") || "Invalid data",
			code: "BAD_REQUEST",
		});
	}

	return data;
}
