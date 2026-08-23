/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
	readonly IMAGE_CDN: import("./const/const").ImageCdn;
	readonly SITE_URL: string;
	readonly BIANCA_EMAIL: string;
	readonly TWITTER_HANDLE: string;
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
}
