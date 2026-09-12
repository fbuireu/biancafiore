import { ActionError, defineAction } from "astro:actions";
import { type ContactParams, submitContact } from "@actions/contact";
import { contactErrorResponse } from "@actions/errorResponse";
import { contactFormSchema } from "@domain/contact/schema";
import { ContactLayer } from "@infrastructure/layers";
import { Effect } from "effect";

export const server = {
	contact: defineAction({
		accept: "form",
		input: contactFormSchema,
		handler: async (params: ContactParams) => {
			const result = await Effect.runPromise(
				submitContact(params).pipe(
					Effect.matchCauseEffect({
						onSuccess: (value) => Effect.succeed({ success: true as const, value }),
						onFailure: (cause) =>
							contactErrorResponse(cause).pipe(Effect.map((error) => ({ success: false as const, error }))),
					}),
					Effect.provide(ContactLayer),
				),
			);

			if (!result.success) throw new ActionError(result.error);

			return result.value;
		},
	}),
};
