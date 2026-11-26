import { z } from "@shared/utils/zod";

export const BOT_REFUSAL_MESSAGE = "Mr. Robot, is that you?";

const ALIAS_REGEX = /\+[^@]*(?=@)/;

export const contactEmailSchema = z
	.string()
	.trim()
	.pipe(z.email({ message: "Still not a valid email fella" }))
	.brand<"ContactEmail">();

export const contactNormalizedEmailSchema = z
	.string()
	.trim()
	.toLowerCase()
	.transform((email) => email.replace(ALIAS_REGEX, ""))
	.brand<"NormalizedContactEmail">();

export const contactFormSchema = z.object({
	name: z.string().trim().min(1, "Please insert your name"),
	email: contactEmailSchema,
	message: z.string().trim().min(1, "Please insert a valid message"),
	recaptcha: z.string().trim().min(1, BOT_REFUSAL_MESSAGE),
});
