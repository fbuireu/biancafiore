import { contactFormSchema } from "@application/entities/contact/schema";
import type { Except } from "@const/types";
import { ValidationError } from "@infrastructure/errors";
import type { ContactFormData } from "@shared/ui/types";
import { Effect } from "effect";

type ValidateContact = Except<ContactFormData, "recaptcha" | "emailId">;

export const validateContact = (contact: ValidateContact): Effect.Effect<ValidateContact, ValidationError> =>
	Effect.suspend(() => {
		const { success, data, error } = contactFormSchema.safeParse(contact);

		return success
			? Effect.succeed(data)
			: Effect.fail(
					new ValidationError({
						message: error?.issues.map((issue) => issue.message).join(", ") || "Invalid data",
					}),
				);
	});
