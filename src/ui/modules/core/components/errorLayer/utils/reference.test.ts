import { describe, expect, it } from "vitest";
import { createErrorReference } from "./reference";

describe("createErrorReference", () => {
	it("answers eight lowercase hexadecimal characters, short enough for a reader to quote", () => {
		expect(createErrorReference()).toMatch(/^[0-9a-f]{8}$/);
	});

	it("answers a different one each time, since each failure needs a reference of its own", () => {
		const references = new Set(Array.from({ length: 50 }, () => createErrorReference()));

		expect(references.size).toBe(50);
	});
});
