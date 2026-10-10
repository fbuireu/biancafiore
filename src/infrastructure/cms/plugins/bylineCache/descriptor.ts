import { fileURLToPath } from "node:url";
import type { PluginDescriptor } from "emdash";
import { BYLINE_CACHE } from "./const";

export function bylineCache(): PluginDescriptor {
	return {
		id: BYLINE_CACHE.ID,
		version: BYLINE_CACHE.VERSION,
		format: "native",
		entrypoint: fileURLToPath(new URL("./plugin.ts", import.meta.url)).replaceAll("\\", "/"),
	};
}
