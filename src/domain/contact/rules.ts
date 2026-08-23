const ALIAS_REGEX = /\+[^@]*(?=@)/;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

export const CONTACT_COOLDOWN_HOURS = 24;

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase().replace(ALIAS_REGEX, "");
}

export function contactCooldownStart(now: Date): string {
	return new Date(now.getTime() - CONTACT_COOLDOWN_HOURS * MILLISECONDS_PER_HOUR).toISOString();
}
