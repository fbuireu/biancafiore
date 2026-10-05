import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "./zod";

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("z", () => {
	it("builds and parses an object schema without compiling code, so a policy without unsafe-eval has nothing to refuse", () => {
		const compile = vi.fn();

		vi.stubGlobal("Function", compile);

		expect(z.object({ name: z.string() }).parse({ name: "Bianca" })).toEqual({ name: "Bianca" });
		expect(compile).not.toHaveBeenCalled();
	});
});
