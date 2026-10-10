import { BYLINES_CACHE_TAG } from "@const/contentCache";
import { definePlugin } from "emdash";
import { BYLINE_CACHE } from "./const";

export async function purgeBylines(): Promise<void> {
	const { cache } = await import("cloudflare:workers");

	await cache.purge({ tags: [BYLINES_CACHE_TAG] });
}

export function createPlugin() {
	return definePlugin({
		id: BYLINE_CACHE.ID,
		version: BYLINE_CACHE.VERSION,
		hooks: { "byline:afterSave": purgeBylines, "byline:afterDelete": purgeBylines },
	});
}
