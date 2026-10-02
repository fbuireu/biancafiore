import { ActionError, defineAction } from "astro:actions";
import { contactFormSchema } from "@domain/contact/schema";
import { ContactLayer } from "@infrastructure/layers";
import { Effect } from "effect";
import { type SubmitContactParams, submitContact } from "./contact";
import { contactErrorResponse } from "./errorResponse";

export const server = {
	contact: defineAction({
		accept: "form",
		input: contactFormSchema,
		handler: async (params: SubmitContactParams) => {
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
