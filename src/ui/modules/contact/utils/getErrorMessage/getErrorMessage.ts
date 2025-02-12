export function getErrorMessage(error: unknown): unknown {
	if (error instanceof Error) {
		return error.message;
	}

	return error;
}
