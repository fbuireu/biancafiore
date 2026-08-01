const secrets = new Map<string, string>();

export function setSecret(name: string, value: string): void {
	secrets.set(name, value);
}

export function resetSecrets(): void {
	secrets.clear();
}

export function getSecret(name: string): string | undefined {
	return secrets.get(name);
}
