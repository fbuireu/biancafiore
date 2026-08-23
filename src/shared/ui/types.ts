import type { Except } from "@const/types";
import type { contactFormSchema } from "@domain/contact/schema";
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

export type FormStatus = (typeof FormStatus)[keyof typeof FormStatus];
