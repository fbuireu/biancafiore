import type { z } from "@shared/utils/zod";
import type { contactEmailSchema, contactFormSchema, contactNormalizedEmailSchema } from "./schema";

export type ContactEmail = z.infer<typeof contactEmailSchema>;

export type NormalizedContactEmail = z.infer<typeof contactNormalizedEmailSchema>;

export type ValidatedContact = Pick<z.infer<typeof contactFormSchema>, "name" | "email" | "message">;
