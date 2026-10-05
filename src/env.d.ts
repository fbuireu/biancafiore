/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
	readonly IMAGE_CDN: import("@const/imageCdn").ImageCdn;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module "@tgwf/co2" {
	interface CO2Options {
		model?: "swd" | "1byte";
		version?: number;
	}

	export class co2 {
		constructor(options?: CO2Options);
		perVisit(bytes: number, green?: boolean): number;
		perByte(bytes: number, green?: boolean): number;
	}
}

type DataLayerEntry = IArguments | unknown[];

interface Window {
	dataLayer: DataLayerEntry[];
	betterstack?: (command: string, ...args: unknown[]) => void;
}
