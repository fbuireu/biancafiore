import { z } from "astro:schema"

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Please insert your name"),
  email: z.string().trim().min(1, "Please insert a valid email").email(),
  message: z.string().trim().min(1, "Please insert a valid message"),
});
