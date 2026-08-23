import { z } from "astro/zod";

export const BOT_REFUSAL_MESSAGE = "Mr. Robot, is that you?";

export const contactFormSchema = z.object({
	name: z.string().trim().min(1, "Please insert your name"),
	email: z
		.string()
		.trim()
		.pipe(z.email({ message: "Still not a valid email fella" })),
	message: z.string().trim().min(1, "Please insert a valid message"),
	recaptcha: z.string().trim().min(1, BOT_REFUSAL_MESSAGE),
});
