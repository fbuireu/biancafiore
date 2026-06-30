import { z } from "astro/zod";

export const contactFormSchema = z.object({
	name: z.string().trim().min(1, "Please insert your name"),
	email: z.email({ message: "Still not a valid email fella" }).trim().min(1, "Please insert a valid email"),
	message: z.string().trim().min(1, "Please insert a valid message"),
});
