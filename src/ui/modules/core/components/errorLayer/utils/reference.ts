const REFERENCE_LENGTH = 8;

export function createErrorReference(): string {
	return crypto.randomUUID().replaceAll("-", "").slice(0, REFERENCE_LENGTH);
}
