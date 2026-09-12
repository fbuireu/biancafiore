import { Effect } from "effect";
import { describe, expect, it, vi } from "vitest";

const loggerDouble = {
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
	logError: vi.fn(),
};

vi.mock("@infrastructure/logging/logger", () => ({ logger: loggerDouble }));

const { LoggerService, LoggerServiceLive } = await import("@infrastructure/logging/service");

describe("LoggerService", () => {
	it("resolves to the same logger object plain code imports, so the tag and the import cannot disagree", async () => {
		const resolved = await Effect.runPromise(LoggerService.pipe(Effect.provide(LoggerServiceLive)));

		expect(resolved).toBe(loggerDouble);
	});

	it("exposes every method the port declares", async () => {
		const resolved = await Effect.runPromise(LoggerService.pipe(Effect.provide(LoggerServiceLive)));

		for (const method of ["info", "warn", "error", "logError"] as const) {
			expect(typeof resolved[method]).toBe("function");
		}
	});
});
