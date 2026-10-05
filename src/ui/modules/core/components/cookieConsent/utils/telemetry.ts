import { BETTER_STACK_TRACKING_TOKEN } from "astro:env/client";

export const BETTER_STACK_TAG_ORIGIN = "https://betterstack.net";

const DEVELOPMENT_HOSTS = ["localhost", "127.0.0.1"];

export type TrackingEnvironment = "production" | "development";

export const trackingEnvironmentFor = (hostname: string): TrackingEnvironment =>
	DEVELOPMENT_HOSTS.includes(hostname) || hostname.endsWith(".workers.dev") ? "development" : "production";

interface Telemetry {
	loadBetterStack(): void;
}

const appendScript = (src: string): void => {
	const script = document.createElement("script");
	script.async = true;
	script.crossOrigin = "anonymous";
	script.src = src;
	document.head.appendChild(script);
};

const queueCallsUntilTheTagLoads = (): void => {
	if (window.betterstack) return;

	const queued: unknown[][] = [];
	const stub = (...args: unknown[]): void => {
		queued.push(args);
	};
	stub.q = queued;
	window.betterstack = stub;
};

function createTelemetry(): Telemetry {
	let betterStackLoaded = false;

	return {
		loadBetterStack() {
			if (!BETTER_STACK_TRACKING_TOKEN || betterStackLoaded) return;

			betterStackLoaded = true;

			queueCallsUntilTheTagLoads();
			appendScript(`${BETTER_STACK_TAG_ORIGIN}/b.js?t=${encodeURIComponent(BETTER_STACK_TRACKING_TOKEN)}`);
			window.betterstack?.("init", { environment: trackingEnvironmentFor(window.location.hostname) });
		},
	};
}

let instance: Telemetry | null = null;

export const getTelemetry = (): Telemetry => (instance ??= createTelemetry());
