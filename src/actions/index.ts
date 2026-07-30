import { ActionError, defineAction } from "astro:actions";
import { type ContactError, type ContactParams, submitContact } from "@actions/contact";
import { contactFormSchema } from "@domain/contact/schema";
import { ContactLayer } from "@infrastructure/layers";
import { Cause, Effect, Option } from "effect";

const GENERIC_ERROR_MESSAGE =
	"Whoopsie! Something went wrong. It's my fault (or actually my boyfriend's). Please try again in a few minutes after refreshing the page.";

function toActionError(cause: Cause.Cause<ContactError>): Effect.Effect<ActionError> {
	const failure = Cause.failureOption(cause);

	if (Option.isSome(failure)) {
		switch (failure.value._tag) {
			case "ValidationError":
				return Effect.succeed(new ActionError({ code: "BAD_REQUEST", message: failure.value.message }));
			case "DuplicateContactError":
				return Effect.succeed(new ActionError({ code: "UNAUTHORIZED", message: failure.value.message }));
		}
	}

	return Effect.logError(Cause.pretty(cause)).pipe(
		Effect.as(new ActionError({ code: "INTERNAL_SERVER_ERROR", message: GENERIC_ERROR_MESSAGE })),
	);
}

export const server = {
	contact: defineAction({
		accept: "form",
		input: contactFormSchema,
		handler: async (params: ContactParams) => {
			const result = await Effect.runPromise(
				submitContact(params).pipe(
					Effect.provide(ContactLayer),
					Effect.matchCauseEffect({
						onSuccess: (value) => Effect.succeed({ success: true as const, value }),
						onFailure: (cause) =>
							toActionError(cause).pipe(Effect.map((error) => ({ success: false as const, error }))),
					}),
				),
			);

			if (!result.success) throw result.error;

			return result.value;
		},
	}),
};
