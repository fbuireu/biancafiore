import { Effect } from "effect";
import { describe, expect, it, vi } from "vitest";

const loggerDouble = {
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
	logError: vi.fn(),
};

vi.mock("./logger", () => ({ logger: loggerDouble }));

const { LoggerService, LoggerServiceLive } = await import("./service");

describe("LoggerService", () => {
	it("resolves to the same logger object plain code imports, so the tag and the import cannot disagree", async () => {
		const resolved = await Effect.runPromise(LoggerService.pipe(Effect.provide(LoggerServiceLive)));

		expect(resolved).toBe(loggerDouble);
	});
});
