// @ts-ignore:next-line
import { ActionError } from "astro:actions";
import { contactFormSchema } from "@application/entities/contact/schema";
import { Exception } from "@domain/errors";
import type { ContactFormData } from "@shared/ui/types";
import type { Except } from "type-fest";

type ValidateContact = Except<ContactFormData, "recaptcha" | "emailId">;

export function validateContact(contact: ValidateContact): ValidateContact {
	try {
		const { success, data, error } = contactFormSchema.safeParse(contact);

		if (!success) {
			throw new Exception({
				message: error?.errors.join(", ") || "Invalid data",
				code: "BAD_REQUEST",
			});
		}

		return data;
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
