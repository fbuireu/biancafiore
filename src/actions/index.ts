import { ActionError, defineAction } from "astro:actions";
import { contactFormSchema } from "@application/entities/contact/schema";
import type { Except } from "@const/types";
import type { DatabaseError, DuplicateContactError, EmailError, ValidationError } from "@infrastructure/errors";
import { ContactLayer } from "@infrastructure/layers";
import { normalizeEmail, sendEmail } from "@infrastructure/utils/email";
import { validateContact, verifyRecaptcha } from "@infrastructure/utils/guards";
import { checkDuplicatedEntries, saveContact } from "@infrastructure/utils/persistence";
import type { ContactFormData } from "@shared/ui/types";
import { Cause, Effect, Option } from "effect";

type ActionHandlerParams = Except<ContactFormData, "emailId"> & { recaptcha: string };
type ContactError = ValidationError | DuplicateContactError | EmailError | DatabaseError;

const GENERIC_ERROR_MESSAGE =
	"Whoopsie! Something went wrong. It's my fault (or actually my boyfriend's). Please try again in a few minutes after refreshing the page.";

function toActionError(cause: Cause.Cause<ContactError>): ActionError {
	const failure = Cause.failureOption(cause);

	if (Option.isSome(failure)) {
		switch (failure.value._tag) {
			case "ValidationError":
				return new ActionError({ code: "BAD_REQUEST", message: failure.value.message });
			case "DuplicateContactError":
				return new ActionError({ code: "UNAUTHORIZED", message: failure.value.message });
		}
	}

	console.error(Cause.pretty(cause));

	return new ActionError({ code: "INTERNAL_SERVER_ERROR", message: GENERIC_ERROR_MESSAGE });
}

export const server = {
	contact: defineAction({
		accept: "form",
		input: contactFormSchema,
		handler: async ({ recaptcha, ...params }: ActionHandlerParams) => {
			const program = Effect.gen(function* () {
				const data = yield* validateContact(params);
				yield* verifyRecaptcha(recaptcha);
				const normalizedData = { ...data, email: normalizeEmail(data.email) };
				yield* checkDuplicatedEntries(normalizedData);
				const { id: emailId } = yield* sendEmail(data);
				yield* saveContact({ emailId, ...normalizedData });

				return { ok: !!emailId };
			});

			const result = await Effect.runPromise(
				program.pipe(
					Effect.provide(ContactLayer),
					Effect.matchCause({
						onSuccess: (value) => ({ success: true as const, value }),
						onFailure: (cause) => ({ success: false as const, error: toActionError(cause) }),
					}),
				),
			);

			if (!result.success) throw result.error;

			return result.value;
		},
	}),
};
