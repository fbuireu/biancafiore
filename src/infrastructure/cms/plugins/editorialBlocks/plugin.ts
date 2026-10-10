import { definePlugin } from "emdash";
import { EDITORIAL_BLOCK_CONFIGS, EDITORIAL_BLOCKS } from "./blocks";

export function createPlugin() {
	return definePlugin({
		id: EDITORIAL_BLOCKS.ID,
		version: EDITORIAL_BLOCKS.VERSION,
		admin: { portableTextBlocks: EDITORIAL_BLOCK_CONFIGS },
	});
}
