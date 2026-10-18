/// <reference path="../.astro/types.d.ts" />

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

interface Document {
	readonly prerendering?: boolean;
}

interface Window {
	dataLayer: DataLayerEntry[];
	betterstack?: (command: string, ...args: unknown[]) => void;
}
