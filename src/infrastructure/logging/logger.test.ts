import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { LOG_LEVEL, LOG_SERVICE, type LogLevel } from "./contract";
import { logger } from "./logger";

const spies = {
	info: vi.spyOn(console, "info").mockImplementation(() => {}),
	warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
	error: vi.spyOn(console, "error").mockImplementation(() => {}),
};

const lineFrom = (level: LogLevel) => JSON.parse(spies[level].mock.calls[0]?.[0] as string);

beforeEach(() => {
	vi.clearAllMocks();
});

afterAll(() => {
	vi.restoreAllMocks();
});

describe("the platform is the transport", () => {
	it("writes one JSON line per call, which is what Cloudflare exports and attributes to the active span", () => {
		logger.info({ message: "contact accepted", context: { emailId: "re_1" } });

		expect(spies.info).toHaveBeenCalledTimes(1);
		expect(lineFrom(LOG_LEVEL.INFO)).toMatchObject({
			message: "contact accepted",
			level: LOG_LEVEL.INFO,
			service: LOG_SERVICE,
			emailId: "re_1",
		});
	});

	it.each(Object.values(LOG_LEVEL))("emits %s through the console method of its own name", (level) => {
		logger[level]({ message: "test event", context: { field: 1 } });

		expect(spies[level]).toHaveBeenCalledTimes(1);
		expect(lineFrom(level)).toMatchObject({ level, field: 1 });
		for (const other of Object.values(LOG_LEVEL)) {
			if (other !== level) expect(spies[other]).not.toHaveBeenCalled();
		}
	});

	it("writes a line with no context at all rather than an empty object", () => {
		logger.info({ message: "bare" });

		expect(lineFrom(LOG_LEVEL.INFO)).toEqual({ service: LOG_SERVICE, level: LOG_LEVEL.INFO, message: "bare" });
	});
});

describe("a caller cannot relabel its own line", () => {
	it("keeps the level the method decided, whatever the context says", () => {
		logger.error({ message: "submission failed", context: { level: LOG_LEVEL.INFO } });

		expect(lineFrom(LOG_LEVEL.ERROR).level).toBe(LOG_LEVEL.ERROR);
	});

	it("keeps the message the caller passed, not one smuggled through the context", () => {
		logger.warn({ message: "the real message", context: { message: "the decoy" } });

		expect(lineFrom(LOG_LEVEL.WARN).message).toBe("the real message");
	});

	it("keeps the service name, so a line cannot claim to come from somewhere else", () => {
		logger.info({ message: "hello", context: { service: "not-this-site" } });

		expect(lineFrom(LOG_LEVEL.INFO).service).toBe(LOG_SERVICE);
	});
});

describe("logger.logError", () => {
	it("includes error message, name and stack in context", () => {
		logger.logError({ message: "test event", error: new Error("boom") });

		const { error } = lineFrom(LOG_LEVEL.ERROR);

		expect(error.message).toBe("boom");
		expect(error.name).toBe("Error");
		expect(error.stack).toContain("Error: boom");
	});

	it("handles non-Error values", () => {
		logger.logError({ message: "test", error: "string error" });

		const { error } = lineFrom(LOG_LEVEL.ERROR);

		expect(error.message).toBe("string error");
		expect(error.name).toBe("UnknownError");
		expect(error.stack).toBeUndefined();
	});

	it("carries the own enumerable fields of an Error subclass beside the standard three", () => {
		const error = Object.assign(new Error("x"), { code: "CONTENTFUL_TIMEOUT" });

		logger.logError({ message: "test", error });

		expect(lineFrom(LOG_LEVEL.ERROR).error.code).toBe("CONTENTFUL_TIMEOUT");
	});

	it("describes a thrown plain object as its JSON rather than as [object Object]", () => {
		logger.logError({ message: "test", error: { code: "E_THROWN", retry: false } });

		expect(lineFrom(LOG_LEVEL.ERROR).error.message).toBe('{"code":"E_THROWN","retry":false}');
	});

	it("keeps the line when the thrown object cannot be serialised, falling back to String()", () => {
		const circular: Record<string, unknown> = {};
		circular.self = circular;

		logger.logError({ message: "test", error: circular });
		logger.logError({ message: "test", error: { size: 1n } });

		expect(spies.error.mock.calls.map(([line]) => JSON.parse(line as string).error.message)).toStrictEqual([
			"[object Object]",
			"[object Object]",
		]);
	});

	it("keeps the line when the thrown object has no prototype to fall back on", () => {
		const bare: Record<string, unknown> = Object.create(null);
		bare.self = bare;

		expect(() => logger.logError({ message: "test", error: bare })).not.toThrow();
		expect(lineFrom(LOG_LEVEL.ERROR).error.message).toBe("[object Object]");
	});

	it("keeps the message, name and stack of an Error whose own field cannot be serialised", () => {
		const loop: Record<string, unknown> = {};
		loop.self = loop;

		logger.logError({ message: "test", error: Object.assign(new Error("boom"), { code: "E_LOOP", loop }) });

		expect(lineFrom(LOG_LEVEL.ERROR).error).toMatchObject({
			message: "boom",
			name: "Error",
			code: "E_LOOP",
			loop: "[unserializable]",
		});
		expect(lineFrom(LOG_LEVEL.ERROR).error.stack).toContain("Error: boom");
	});

	it("merges caller context with error context", () => {
		logger.logError({ message: "test", error: new Error("x"), context: { emailId: "re_1" } });

		const line = lineFrom(LOG_LEVEL.ERROR);

		expect(line.emailId).toBe("re_1");
		expect(line.error.message).toBe("x");
	});
});

describe("a log never fails its caller", () => {
	it("writes a context value that cannot be serialised as [unserializable] and keeps the rest of the line, rather than throwing from a render", () => {
		const circular: Record<string, unknown> = {};
		circular.self = circular;

		expect(() =>
			logger.info({ message: "round trip", context: { circular, size: 1n, emailId: "re_1" } }),
		).not.toThrow();
		expect(lineFrom(LOG_LEVEL.INFO)).toEqual({
			circular: "[unserializable]",
			size: "[unserializable]",
			emailId: "re_1",
			service: LOG_SERVICE,
			level: LOG_LEVEL.INFO,
			message: "round trip",
		});
	});

	it("swallows a console that throws synchronously", () => {
		spies.error.mockImplementationOnce(() => {
			throw new Error("sink down");
		});

		expect(() => logger.error({ message: "still fine" })).not.toThrow();
	});
});

describe("url redaction", () => {
	it("strips the query string off a url in the log context, so a token in it never reaches the sink", () => {
		logger.error({
			message: "render failed",
			context: { url: "https://biancafiore.me/contact?recaptcha=redacted-in-fixture" },
		});

		const [line] = spies.error.mock.calls[0] as [string];

		expect(JSON.parse(line).url).toBe("https://biancafiore.me/contact");
		expect(line).not.toContain("redacted-in-fixture");
	});

	it("strips it on the logError path too, whichever method emitted the line", () => {
		logger.logError({
			message: "render failed",
			error: new Error("x"),
			context: { url: "https://biancafiore.me/articles/one?utm_source=news" },
		});

		expect(lineFrom(LOG_LEVEL.ERROR).url).toBe("https://biancafiore.me/articles/one");
	});

	it("leaves a non-string url alone", () => {
		logger.info({ message: "no url", context: { url: 42 } });

		expect(lineFrom(LOG_LEVEL.INFO).url).toBe(42);
	});
});
