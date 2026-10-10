import { isAbsolute } from "node:path";
import { BYLINES_CACHE_TAG, CONTENT_CACHE } from "@const/contentCache";
import { purgedTags } from "@tests/doubles/cloudflareWorkers";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BYLINE_CACHE } from "./const";
import { bylineCache } from "./descriptor";
import { createPlugin, purgeBylines } from "./plugin";

vi.mock("emdash", () => ({ definePlugin: (definition: unknown) => definition }));

afterEach(() => {
	purgedTags.length = 0;
});

describe("the byline cache plugin", () => {
	it("purges on every byline save and delete, which EmDash's own byline routes never do", () => {
		const { hooks } = createPlugin() as unknown as { hooks: Record<string, unknown> };

		expect(hooks).toStrictEqual({ "byline:afterSave": purgeBylines, "byline:afterDelete": purgeBylines });
	});

	it("purges the one tag every content route carries for bylines", async () => {
		await purgeBylines();

		expect(purgedTags).toStrictEqual([[BYLINES_CACHE_TAG]]);
		expect(CONTENT_CACHE.tags).toContain(BYLINES_CACHE_TAG);
	});

	it("names its entrypoint by an absolute path with forward slashes", () => {
		const { entrypoint, id } = bylineCache();

		expect(id).toBe(BYLINE_CACHE.ID);
		expect(isAbsolute(entrypoint)).toBe(true);
		expect(entrypoint).not.toContain("\\");
	});
});
