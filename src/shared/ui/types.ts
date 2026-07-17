import type { contactFormSchema } from "@application/entities/contact/schema";
import type { Except } from "@const/types";
import type { z } from "astro/zod";

export type ContactFormData = Except<z.infer<typeof contactFormSchema>, "recaptcha"> & {
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
