import type { Except } from "@const/types";
import type { contactFormSchema } from "@domain/contact/schema";
import type { z } from "astro/zod";

export type ContactFormData = Except<z.infer<typeof contactFormSchema>, "recaptcha"> & {
	recaptcha?: string;
	emailId?: string;
};
