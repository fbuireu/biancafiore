import { fileURLToPath } from "node:url";
import type { PluginDescriptor } from "emdash";
import { EDITORIAL_BLOCK_CONFIGS, EDITORIAL_BLOCKS } from "./blocks";

export function editorialBlocks(): PluginDescriptor {
	return {
		id: EDITORIAL_BLOCKS.ID,
		version: EDITORIAL_BLOCKS.VERSION,
		format: "native",
		entrypoint: fileURLToPath(new URL("./plugin.ts", import.meta.url)).replaceAll("\\", "/"),
		portableTextBlocks: EDITORIAL_BLOCK_CONFIGS,
	};
}
