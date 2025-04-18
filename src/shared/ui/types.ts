import type { z } from "astro:schema";
import type { contactFormSchema } from "@application/entities/contact/schema";

export type ContactFormData = z.infer<typeof contactFormSchema> & {
	recaptcha?: string;
	emailId?: string;
};

export const FormStatus = {
	INITIAL: "initial",
	LOADING: "loading",
	SUCCESS: "success",
	ERROR: "error",
	UNAUTHORIZED: "unauthorized",
} as const;
