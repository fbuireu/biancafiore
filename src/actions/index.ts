import { ActionError, defineAction } from "astro:actions";
import { contactFormSchema } from "@domain/contact/schema";
import { answerContact, type SubmitContactParams } from "./contact";

export const server = {
	contact: defineAction({
		accept: "form",
		input: contactFormSchema,
		handler: async (params: SubmitContactParams) => {
			const result = await answerContact(params);

			if (!result.success) throw new ActionError(result.error);

			return result.value;
		},
	}),
};
