import { definePlugin, type ResolvedPlugin } from "emdash";
import { EDITORIAL_BLOCK_CONFIGS, EDITORIAL_BLOCKS } from "./blocks";
import { requireImageDescriptions } from "./imageDescriptions";

export function createPlugin(): ResolvedPlugin {
	return definePlugin({
		id: EDITORIAL_BLOCKS.ID,
		version: EDITORIAL_BLOCKS.VERSION,
		capabilities: ["hooks.content-policy:register"],
		hooks: {
			"content:beforePublish": requireImageDescriptions,
			"content:beforeSchedule": requireImageDescriptions,
		},
		admin: { portableTextBlocks: EDITORIAL_BLOCK_CONFIGS },
	});
}
