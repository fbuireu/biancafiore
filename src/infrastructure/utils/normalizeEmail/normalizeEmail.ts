const ALIAS_REGEX = /\+.*?(?=@)/;

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase().replace(ALIAS_REGEX, "");
}
