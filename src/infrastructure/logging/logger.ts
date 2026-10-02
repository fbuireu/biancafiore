import { LOG_LEVEL, LOG_SERVICE, type LogLevel, stripQuery } from "./contract";

type LogContext = Record<string, unknown>;

export interface LogParams {
	message: string;
	context?: LogContext;
}

export interface LogErrorParams extends LogParams {
	error: unknown;
}

interface WriteParams extends LogParams {
	level: LogLevel;
}

export interface Logger {
	info(params: LogParams): void;
	warn(params: LogParams): void;
	error(params: LogParams): void;
	logError(params: LogErrorParams): void;
}

const UNSERIALIZABLE = "[unserializable]";

const redacted = (context: LogContext = {}): LogContext =>
	typeof context.url === "string" ? { ...context, url: stripQuery(context.url) } : context;

const fitsJson = (value: unknown): boolean => {
	try {
		JSON.stringify(value);

		return true;
	} catch {
		return false;
	}
};

const serializable = (context: LogContext): LogContext =>
	Object.fromEntries(Object.entries(context).map(([key, value]) => [key, fitsJson(value) ? value : UNSERIALIZABLE]));

const textOf = (value: object): string => {
	try {
		return String(value);
	} catch {
		return Object.prototype.toString.call(value);
	}
};

const describeValue = (value: unknown): string => {
	if (value instanceof Error) return value.message;
	if (typeof value !== "object" || value === null) return String(value);

	return fitsJson(value) ? JSON.stringify(value) : textOf(value);
};

const describeError = (error: unknown): LogContext => ({
	message: describeValue(error),
	name: error instanceof Error ? error.name : "UnknownError",
	stack: error instanceof Error ? error.stack : undefined,
	...(error instanceof Error
		? serializable(
				Object.fromEntries(Object.entries(error).filter(([key]) => !["message", "name", "stack"].includes(key))),
			)
		: {}),
});

const write = ({ level, message, context }: WriteParams): void => {
	console[level](JSON.stringify({ ...serializable(redacted(context)), service: LOG_SERVICE, level, message }));
};

const safely = (log: () => void): void => {
	try {
		log();
	} catch {
		return;
	}
};

export const logger: Logger = {
	info: (params) => safely(() => write({ level: LOG_LEVEL.INFO, ...params })),
	warn: (params) => safely(() => write({ level: LOG_LEVEL.WARN, ...params })),
	error: (params) => safely(() => write({ level: LOG_LEVEL.ERROR, ...params })),
	logError: ({ message, error, context }) =>
		safely(() => write({ level: LOG_LEVEL.ERROR, message, context: { ...context, error: describeError(error) } })),
};
