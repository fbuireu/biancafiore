import { LOG_LEVEL, LOG_SERVICE, type LogLevel, stripQuery } from "@infrastructure/logging/contract";

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

const redacted = (context: LogContext = {}): LogContext =>
	typeof context.url === "string" ? { ...context, url: stripQuery(context.url) } : context;

const describeValue = (value: unknown): string => {
	if (value instanceof Error) return value.message;
	if (typeof value !== "object" || value === null) return String(value);

	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
};

const describeError = (error: unknown): LogContext => ({
	message: describeValue(error),
	name: error instanceof Error ? error.name : "UnknownError",
	stack: error instanceof Error ? error.stack : undefined,
	...(error instanceof Error
		? Object.fromEntries(Object.entries(error).filter(([key]) => !["message", "name", "stack"].includes(key)))
		: {}),
});

const write = ({ level, message, context }: WriteParams): void => {
	try {
		console[level](JSON.stringify({ ...redacted(context), service: LOG_SERVICE, level, message }));
	} catch {
		return;
	}
};

export const logger: Logger = {
	info: (params) => write({ level: LOG_LEVEL.INFO, ...params }),
	warn: (params) => write({ level: LOG_LEVEL.WARN, ...params }),
	error: (params) => write({ level: LOG_LEVEL.ERROR, ...params }),
	logError: ({ message, error, context }) =>
		write({ level: LOG_LEVEL.ERROR, message, context: { ...context, error: describeError(error) } }),
};
