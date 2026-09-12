export const LOG_SERVICE = "biancafiore-web";

export const LOG_LEVEL = {
	INFO: "info",
	WARN: "warn",
	ERROR: "error",
} as const;

export type LogLevel = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];

export const stripQuery = (url: string | undefined): string | undefined => {
	if (!url) return undefined;

	try {
		const parsed = new URL(url);

		return `${parsed.origin}${parsed.pathname}`;
	} catch {
		return undefined;
	}
};
