import { z } from "astro:schema";

export const contactFormSchema = z.object({
	id: z.string(),
	name: z.string().trim().min(1, "Please insert your name"),
	email: z
		.string()
		.email()
		.trim()
		.min(1, "Please insert a valid email")
		.email({ message: "Still not a valid email fella" }),
	message: z.string().trim().min(1, "Please insert a valid message"),
});
