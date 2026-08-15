import { LibsqlError } from "@libsql/client/web";

const UNIQUE_CONSTRAINT_CODE = "SQLITE_CONSTRAINT";

export function isUniqueConstraintViolation(cause: unknown): boolean {
	const visited = new Set<unknown>();
	let current = cause;

	while (current instanceof Error && !visited.has(current)) {
		visited.add(current);

		if (current instanceof LibsqlError && current.code.startsWith(UNIQUE_CONSTRAINT_CODE)) return true;

		current = current.cause;
	}

	return false;
}
