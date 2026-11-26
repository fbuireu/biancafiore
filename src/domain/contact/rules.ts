import { contactNormalizedEmailSchema } from "./schema";
import type { ContactEmail, NormalizedContactEmail } from "./types";

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

const CONTACT_COOLDOWN_HOURS = 24;

export function normalizeEmail(email: ContactEmail): NormalizedContactEmail {
	return contactNormalizedEmailSchema.parse(email);
}

export function contactCooldownStart(now: Date): string {
	return new Date(now.getTime() - CONTACT_COOLDOWN_HOURS * MILLISECONDS_PER_HOUR).toISOString();
}
