import { fileURLToPath } from "node:url";
import type { PluginDescriptor } from "emdash";
import { EMAIL_DELIVERY } from "./const";

export function emailDelivery(): PluginDescriptor {
	return {
		id: EMAIL_DELIVERY.ID,
		version: EMAIL_DELIVERY.VERSION,
		format: "native",
		entrypoint: fileURLToPath(new URL("./plugin.ts", import.meta.url)).replaceAll("\\", "/"),
	};
}
