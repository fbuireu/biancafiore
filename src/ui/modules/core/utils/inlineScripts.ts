import { createHash } from "node:crypto";
import loadDirective from "astro/runtime/client/load.prebuilt.js";
import islandRuntime from "astro/runtime/server/astro-island.prebuilt.js";
import { consentBootstrapScript } from "../components/cookieConsent/utils/consentGate";
import { THEME_BOOTSTRAP_SCRIPT } from "../components/themeToggle/utils/preference";

const digest = (source: string): string => createHash("sha256").update(source, "utf8").digest("base64");

const inlineScripts = (analyticsId: string): string[] => [
	THEME_BOOTSTRAP_SCRIPT,
	consentBootstrapScript(analyticsId),
	islandRuntime,
	loadDirective,
];

export const inlineScriptHashes = (analyticsId: string): string[] => inlineScripts(analyticsId).map(digest);
