const secrets = new Map<string, string>();

interface SetSecretParams {
	name: string;
	value: string;
}

export function setSecret({ name, value }: SetSecretParams): void {
	secrets.set(name, value);
}

export function resetSecrets(): void {
	secrets.clear();
}

export function getSecret(name: string): string | undefined {
	return secrets.get(name);
}
